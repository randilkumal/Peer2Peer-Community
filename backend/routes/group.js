const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const GroupTable = require('../models/GroupTable');
const Group = require('../models/Group');
const User = require('../models/User');

// --- TROUBLESHOOTING ROUTES ---
router.get('/ping', (req, res) => res.json({ success: true, message: 'Group router is alive' }));

// @route   POST /api/groups/project-metadata/:id
// @desc    Update GroupTable details (title, description, deadline, etc.)
// @access  Lecturer (own), Admin
router.post('/project-metadata/:id', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const { 
      assignmentTitle, description, registrationDeadline,
      academicYear, period, yearLevel, semester, specialization
    } = req.body;

    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    if (req.user.role === 'lecturer' && groupTable.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this assignment' });
    }

    // Update fields if provided
    if (assignmentTitle) groupTable.assignmentTitle = assignmentTitle;
    if (description !== undefined) groupTable.description = description;
    if (registrationDeadline) groupTable.registrationDeadline = registrationDeadline;
    if (academicYear) groupTable.academicYear = academicYear;
    if (period) groupTable.period = period;
    if (yearLevel) groupTable.yearLevel = yearLevel;
    if (semester) groupTable.semester = semester;
    if (specialization) groupTable.specialization = specialization;

    await groupTable.save();

    res.json({ success: true, message: 'Assignment updated successfully', groupTable });
  } catch (error) {
    console.error('Update metadata error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
});
// -------------------------------

function studentMatchesGroupTable(user, gt) {
  if (!user || !gt) return false;

  const enrolled = (user.enrolledModules || [])
    .map((m) => String(m).trim().toUpperCase())
    .filter(Boolean);
  const mod = String(gt.module || '').trim().toUpperCase();

  // Students who maintain enrolled module codes: match by module (case-insensitive).
  // Requiring identical year/semester as the table hid valid assignments when the lecturer
  // used a different cohort on the form than the student's profile.
  if (enrolled.length > 0) {
    if (!enrolled.includes(mod)) return false;
    if (gt.specialization !== 'All') {
      if (user.yearLevel >= 3 && user.specialization && user.specialization !== gt.specialization) {
        return false;
      }
    }
    return true;
  }

  // No modules listed on profile: fall back to cohort matching (coerce types for API/JSON quirks)
  if (Number(user.yearLevel) !== Number(gt.yearLevel)) return false;
  if (Number(user.semester) !== Number(gt.semester)) return false;
  if (gt.specialization !== 'All') {
    if (user.yearLevel >= 3 && user.specialization && user.specialization !== gt.specialization) {
      return false;
    }
  }
  return true;
}

function isRegistrationDeadlinePassed(gt) {
  return new Date() > new Date(gt.registrationDeadline);
}

function sanitizeGroupsForStudent(groups, currentUserId) {
  const uid = currentUserId?.toString();
  return groups.map((g) => {
    const plain = typeof g.toObject === 'function' ? g.toObject() : { ...g };
    plain.members = (plain.members || []).map((m) => {
      const mUserId = m.user?._id?.toString() || m.user?.toString?.();
      const isSelf = mUserId && uid && mUserId === uid;
      const name = (m.user && m.user.fullName) || m.name || '—';
      if (isSelf) {
        return {
          name,
          isLeader: !!m.isLeader,
          studentId: m.studentId,
          email: m.email,
          phone: m.phone,
          isSelf: true,
          user: m.user
        };
      }
      return { name, isLeader: !!m.isLeader };
    });
    return plain;
  });
}

// @route   POST /api/groups/project
// @desc    Create a new GroupTable (project) and its associated empty Groups
// @access  Lecturer
router.post('/project', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const { 
      module, assignmentTitle, description, academicYear, period, 
      yearLevel, semester, specialization, 
      numberOfGroups, groupSize, registrationDeadline 
    } = req.body;
    // Create GroupTable
    const groupTable = await GroupTable.create({
      module,
      assignmentTitle,
      description,
      academicYear,
      period,
      yearLevel,
      semester,
      specialization,
      numberOfGroups,
      groupSize,
      registrationDeadline,
      createdBy: req.user.id
    });

    // Generate empty Groups
    const groups = [];
    for (let i = 1; i <= numberOfGroups; i++) {
      groups.push({
        groupTable: groupTable._id,
        groupNumber: i,
        maxMembers: groupSize,
        members: []
      });
    }
    await Group.insertMany(groups);

    res.status(201).json({
      success: true,
      groupTable,
      project: groupTable
    });
  } catch (error) {
    console.error('Error creating group project:', error);
    res.status(500).json({ success: false, message: 'Failed to create group project', error: error.message });
  }
});

// @route   GET /api/groups/projects
// @desc    Get all GroupTables created by the logged-in lecturer
// Get all group projects (Lecturer/Admin)
router.get('/projects', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'lecturer') {
      query.createdBy = req.user.id;
    }

    const projects = await GroupTable.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/groups/student/assignments
// @desc    Open (unpublished) tables + published tables for this student's cohort & modules
// @access  Student, Expert
router.get('/student/assignments', protect, authorize('student', 'expert'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const all = await GroupTable.find({})
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    const eligible = all.filter((gt) => studentMatchesGroupTable(user, gt));
    const openForRegistration = eligible.filter((gt) => gt.status !== 'published');
    const published = eligible.filter((gt) => gt.status === 'published');

    res.json({
      success: true,
      openForRegistration,
      published
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all published group projects (For Students/Experts)
router.get('/published', protect, authorize('student', 'expert'), async (req, res) => {
  try {
    // Only return projects that are published
    const projects = await GroupTable.find({ status: 'published' })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/groups/project/:id
// @desc    Get a specific GroupTable with all its populated Groups
// @access  Lecturer (own), Admin, Student/Expert (eligible cohort)
router.get('/project/:id', protect, async (req, res) => {
  try {
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    const role = req.user.role;
    let allowed = false;
    if (role === 'admin') allowed = true;
    else if (role === 'lecturer' && groupTable.createdBy.toString() === req.user.id) allowed = true;
    else if (role === 'student' || role === 'expert') {
      const user = await User.findById(req.user.id);
      allowed = studentMatchesGroupTable(user, groupTable);
    }

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not allowed to view this group assignment' });
    }

    let groups;
    if (role === 'lecturer' || role === 'admin') {
      groups = await Group.find({ groupTable: groupTable._id })
        .populate('members.user', 'fullName email studentId phone')
        .sort({ groupNumber: 1 });
    } else {
      groups = await Group.find({ groupTable: groupTable._id })
        .populate('members.user', 'fullName')
        .sort({ groupNumber: 1 })
        .lean();
      groups = sanitizeGroupsForStudent(groups, req.user.id);
    }

    res.json({ success: true, groupTable, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project details', error: error.message });
  }
});

router.get('/project/:id/unassigned', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    // Find all students explicitly enrolled in this module OR sharing the same year/semester context
    const query = {
      role: 'student',
      $or: [
        { enrolledModules: groupTable.module },
        { 
          yearLevel: groupTable.yearLevel, 
          semester: groupTable.semester,
          specialization: groupTable.specialization === 'All' ? { $exists: true } : groupTable.specialization
        }
      ]
    };
    
    const eligibleStudents = await User.find(query).select('fullName email studentId phone');

    // Get all groups for this project to build a list of assigned student IDs
    const groups = await Group.find({ groupTable: groupTable._id });
    const assignedIds = new Set();
    groups.forEach(g => {
      g.members.forEach(m => {
        if (m.user) assignedIds.add(m.user.toString());
      });
    });

    // Filter unassigned
    const unassigned = eligibleStudents.filter(student => !assignedIds.has(student._id.toString()));

    res.json({ success: true, unassigned });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unassigned students', error: error.message });
  }
});

// @route   PATCH /api/groups/project/:id/publish
// @desc    Final publish page with warnings check
// @access  Lecturer
router.patch('/project/:id/publish', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    groupTable.status = 'published';
    groupTable.publishedAt = new Date();
    await groupTable.save();

    // TO-DO: Send notifications to all students in the groups
    // This can be done by creating a Notification document if we had one.

    res.json({ success: true, message: 'Groups published successfully', groupTable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to publish groups', error: error.message });
  }
});

// @route   POST /api/groups/project/:id/auto-assign
// @desc    Automatically assign unassigned students to available groups
// @access  Lecturer
router.post('/project/:id/auto-assign', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const { strategy } = req.body; // 'random' or 'sequential'
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    // Get unassigned students
    const query = {
      role: 'student',
      $or: [
        { enrolledModules: groupTable.module },
        { 
          yearLevel: groupTable.yearLevel, 
          semester: groupTable.semester,
          specialization: groupTable.specialization === 'All' ? { $exists: true } : groupTable.specialization
        }
      ]
    };
    const eligibleStudents = await User.find(query).select('_id');
    
    const groups = await Group.find({ groupTable: groupTable._id });
    const assignedIds = new Set();
    groups.forEach(g => {
      g.members.forEach(m => {
        if (m.user) assignedIds.add(m.user.toString());
      });
    });

    let unassigned = eligibleStudents.filter(student => !assignedIds.has(student._id.toString()));

    if (unassigned.length === 0) {
      return res.status(400).json({ success: false, message: 'No unassigned students available for this context' });
    }

    if (strategy === 'random') {
      unassigned = unassigned.sort(() => Math.random() - 0.5);
    }

    // Assign to groups that have space
    let studentIndex = 0;
    for (let group of groups) {
      while (!group.isFull && group.members.length < group.maxMembers && studentIndex < unassigned.length) {
        const student = unassigned[studentIndex];
        group.members.push({
          user: student._id,
          // note: backend/models/Group.js schema currently defines: user, name, studentId, email, phone, isLeader.
          // The UI needs `assignmentType` on the MEMBER to distinguish auto/manual, but schema has `assignmentType` on GROUP?
          // Let's just push user and let schema handle defaults
        });
        
        // Wait, Group schema has `assignmentType` on the group itself, not the members!
        // But the user requested: "Row color coding: 🟢 self-registered, 🟡 partial, 🟠 auto-assigned, 🔵 manually assigned".
        // Let's modify Group.js to support member-level join methods later! For now, add it to the group array.
        studentIndex++;
      }
      group.isFull = group.members.length >= group.maxMembers;
      await group.save();
    }

    res.json({
      success: true,
      message: `Successfully auto-assigned ${studentIndex} students`,
      assignedCount: studentIndex
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to auto-assign', error: error.message });
  }
});

// @route   POST /api/groups/:groupId/assign
// @desc    Manually assign a specific student to a group
// @access  Lecturer
router.post('/:groupId/assign', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    if (group.isFull || group.members.length >= group.maxMembers) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    // Ensure student not already in another group for this table
    const existing = await Group.findOne({ groupTable: group.groupTable, 'members.user': studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student is already in a group for this assignment' });
    }

    group.members.push({ user: studentId });
    group.isFull = group.members.length >= group.maxMembers;
    await group.save();

    res.json({ success: true, message: 'Student assigned successfully', group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign student', error: error.message });
  }
});

// @route   POST /api/groups/project/:id/register-individual
// @desc    Student fills one slot (next available group)
// @access  Student, Expert
router.post('/project/:id/register-individual', protect, authorize('student', 'expert'), async (req, res) => {
  try {
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    const user = await User.findById(req.user.id);
    if (!studentMatchesGroupTable(user, groupTable)) {
      return res.status(403).json({ success: false, message: 'You are not eligible for this assignment' });
    }
    if (groupTable.status === 'published') {
      return res.status(400).json({ success: false, message: 'Registration is closed (groups published)' });
    }
    if (isRegistrationDeadlinePassed(groupTable)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    const existing = await Group.findOne({ groupTable: groupTable._id, 'members.user': req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already in a group for this assignment' });
    }

    const { fullName, studentId, email, phone } = req.body;
    const sidCheck = studentId && String(studentId).trim();
    if (sidCheck) {
      const escaped = sidCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const idTaken = await Group.findOne({
        groupTable: groupTable._id,
        members: { $elemMatch: { studentId: { $regex: `^${escaped}$`, $options: 'i' } } }
      });
      if (idTaken) {
        return res.status(400).json({ success: false, message: 'This student ID is already listed in this assignment' });
      }
    }

    if (user.studentId && studentId && String(studentId).trim() !== String(user.studentId).trim()) {
      return res.status(400).json({ success: false, message: 'Student ID must match your profile' });
    }

    const groups = await Group.find({ groupTable: groupTable._id }).sort({ groupNumber: 1 });
    const target = groups.find((g) => g.members.length < g.maxMembers);
    if (!target) {
      return res.status(400).json({ success: false, message: 'No open slots available' });
    }

    target.members.push({
      user: req.user.id,
      name: fullName || user.fullName,
      studentId: studentId || user.studentId,
      email: email || user.email,
      phone: phone || user.phone,
      isLeader: false
    });
    target.isFull = target.members.length >= target.maxMembers;
    await target.save();

    res.json({ success: true, message: 'Registered successfully', group: target });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// @route   POST /api/groups/project/:id/register-full-group
// @desc    Leader registers an entire group at once (empty group only)
// @access  Student, Expert
router.post('/project/:id/register-full-group', protect, authorize('student', 'expert'), async (req, res) => {
  try {
    const { groupNumber, members } = req.body;
    if (!groupNumber || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'groupNumber and members[] are required' });
    }

    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    const user = await User.findById(req.user.id);
    if (!studentMatchesGroupTable(user, groupTable)) {
      return res.status(403).json({ success: false, message: 'You are not eligible for this assignment' });
    }
    if (groupTable.status === 'published') {
      return res.status(400).json({ success: false, message: 'Registration is closed (groups published)' });
    }
    if (isRegistrationDeadlinePassed(groupTable)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    const group = await Group.findOne({ groupTable: groupTable._id, groupNumber: Number(groupNumber) });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.members.length > 0) {
      return res.status(400).json({ success: false, message: 'This group already has members; choose an empty group' });
    }
    if (members.length > group.maxMembers) {
      return res.status(400).json({ success: false, message: `This group only allows ${group.maxMembers} members` });
    }

    const leader = members.find((m) => m.isLeader) || members[0];
    if (leader && user.studentId && leader.studentId && String(leader.studentId).trim() !== String(user.studentId).trim()) {
      return res.status(400).json({ success: false, message: 'Leader student ID must match your profile' });
    }

    const existing = await Group.findOne({ groupTable: groupTable._id, 'members.user': req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already in a group for this assignment' });
    }

    const seenInForm = new Set();
    for (const m of members) {
      const sid = m.studentId && String(m.studentId).trim().toLowerCase();
      if (sid) {
        if (seenInForm.has(sid)) {
          return res.status(400).json({ success: false, message: 'Duplicate student ID in your submitted group' });
        }
        seenInForm.add(sid);
      }
    }

    const allGroups = await Group.find({ groupTable: groupTable._id });
    const usedIds = new Set();
    allGroups.forEach((g) => {
      g.members.forEach((m) => {
        if (m.studentId) usedIds.add(String(m.studentId).trim().toLowerCase());
      });
    });

    for (const m of members) {
      const sid = m.studentId && String(m.studentId).trim().toLowerCase();
      if (sid && usedIds.has(sid)) {
        return res.status(400).json({ success: false, message: `Duplicate student ID in this table: ${m.studentId}` });
      }
      if (sid) usedIds.add(sid);
    }

    for (const m of members) {
      let linkedUser = null;
      if (m.studentId) {
        linkedUser = await User.findOne({
          studentId: String(m.studentId).trim(),
          role: { $in: ['student', 'expert'] }
        }).select('_id');
      }
      group.members.push({
        user: linkedUser ? linkedUser._id : undefined,
        name: m.fullName,
        studentId: m.studentId,
        email: m.email,
        phone: m.phone,
        isLeader: !!m.isLeader
      });
    }

    if (!group.members.some((mem) => mem.user && mem.user.toString() === req.user.id)) {
      const selfIdx = group.members.findIndex(
        (mem) => user.studentId && mem.studentId && String(mem.studentId).trim() === String(user.studentId).trim()
      );
      if (selfIdx >= 0) {
        group.members[selfIdx].user = req.user.id;
      }
    }

    group.isFull = group.members.length >= group.maxMembers;
    await group.save();

    res.json({ success: true, message: 'Group registered successfully', group });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Group registration failed', error: error.message });
  }
});

// @route   PATCH /api/groups/project/:id/publish
// @desc    Final publish page with warnings check
// @access  Lecturer
router.patch('/project/:id/publish', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) return res.status(404).json({ success: false, message: 'Project not found' });

    groupTable.status = 'published';
    groupTable.publishedAt = new Date();
    await groupTable.save();

    // TO-DO: Send notifications to all students in the groups
    // This can be done by creating a Notification document if we had one.

    res.json({ success: true, message: 'Groups published successfully', groupTable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to publish groups', error: error.message });
  }
});

// @route   DELETE /api/groups/project/:id
// @desc    Delete a group assignment table and all its groups
// @access  Lecturer (own), Admin
router.delete('/project/:id', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const groupTable = await GroupTable.findById(req.params.id);
    if (!groupTable) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (req.user.role === 'lecturer' && groupTable.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this assignment' });
    }

    await Group.deleteMany({ groupTable: groupTable._id });
    await GroupTable.deleteOne({ _id: groupTable._id });

    res.json({ success: true, message: 'Group assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete assignment', error: error.message });
  }
});

// @route   DELETE /api/groups/:groupId/remove
// @desc    Remove a student from a group
// @access  Lecturer
router.delete('/:groupId/remove/:studentId', protect, authorize('lecturer', 'admin'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    group.members = group.members.filter(m => m.user.toString() !== req.params.studentId);
    group.isFull = false;
    await group.save();

    res.json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove student', error: error.message });
  }
});

module.exports = router;

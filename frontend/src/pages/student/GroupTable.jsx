import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ChevronRight, Search, Filter, Users, ArrowLeft, Lock, CalendarClock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const emptyMemberRow = () => ({
  fullName: '',
  studentId: '',
  email: '',
  phone: '',
  isLeader: false
});

const StudentGroupTable = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groupTable, setGroupTable] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedEmptyGroup, setSelectedEmptyGroup] = useState('');
  const [fullMembers, setFullMembers] = useState([]);
  const [submittingFull, setSubmittingFull] = useState(false);
  const [submittingIndiv, setSubmittingIndiv] = useState(false);

  const [indiv, setIndiv] = useState(() => ({
    fullName: user?.fullName || '',
    studentId: user?.studentId || '',
    email: user?.email || '',
    phone: user?.phone || ''
  }));

  useEffect(() => {
    fetchData();
  }, [projectId]);

  useEffect(() => {
    if (user) {
      setIndiv(prev => ({
        fullName: prev.fullName || user.fullName || '',
        studentId: prev.studentId || user.studentId || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectRes = await API.get(`/groups/project/${projectId}`);
      const gt = projectRes.data.groupTable;
      const g = projectRes.data.groups || [];
      setGroupTable(gt);
      setGroups(g);
    } catch (error) {
      console.error('Error fetching group details:', error);
      navigate('/student/groups');
    } finally {
      setLoading(false);
    }
  };

  const getGroupName = (num) => String.fromCharCode(64 + num);

  const isPublished = groupTable?.status === 'published';
  const deadlinePassed = groupTable ? new Date() > new Date(groupTable.registrationDeadline) : false;
  const registrationLocked = isPublished || deadlinePassed;
  const canRegister = groupTable && !registrationLocked;

  const myGroup = useMemo(() => {
    if (!groups.length) return null;
    return groups.find((g) => g.members?.some((m) => m.isSelf)) || null;
  }, [groups]);

  const emptyGroups = useMemo(() => groups.filter((g) => (g.members?.length || 0) === 0), [groups]);

  useEffect(() => {
    if (!groupTable || !selectedEmptyGroup) {
      setFullMembers([]);
      return;
    }
    const g = groups.find((x) => String(x._id) === String(selectedEmptyGroup));
    const n = g ? g.maxMembers : groupTable.groupSize;
    
    setFullMembers(Array.from({ length: n }, (_, i) => {
      if (i === 0 && user) {
        return {
          fullName: user.fullName || '',
          studentId: user.studentId || '',
          email: user.email || '',
          phone: user.phone || '',
          isLeader: false
        };
      }
      return { ...emptyMemberRow(), isLeader: false };
    }));
  }, [selectedEmptyGroup, groupTable, groups, user]);

  const filteredGroups = groups.filter((g) => {
    const label = `Group ${getGroupName(g.groupNumber)}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    if (label.includes(q)) return true;
    return (g.members || []).some((m) => (m.name || '').toLowerCase().includes(q));
  });

  const totalCapacity = groupTable ? groupTable.numberOfGroups * groupTable.groupSize : 0;
  const totalAssigned = groups.reduce((acc, g) => acc + (g.members?.length || 0), 0);
  const fillPercentage = totalCapacity ? Math.round((totalAssigned / totalCapacity) * 100) : 0;

  const handleFullRowChange = (index, field, value) => {
    setFullMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleLeaderRadio = (index) => {
    setFullMembers((prev) => prev.map((row, i) => ({ ...row, isLeader: i === index })));
  };

  const submitFullGroup = async (e) => {
    e.preventDefault();
    if (!selectedEmptyGroup) {
      toast.error('Choose an empty group.');
      return;
    }
    const g = groups.find((x) => String(x._id) === String(selectedEmptyGroup));
    if (!g) return;
    const filled = fullMembers.filter((m) => m.fullName?.trim() && m.studentId?.trim());
    if (filled.length !== g.maxMembers) {
      toast.error(`Enter all ${g.maxMembers} members (name and student ID required for each).`);
      return;
    }
    if (!filled.some((m) => m.isLeader)) {
      toast.error('Mark one member as group leader.');
      return;
    }
    try {
      setSubmittingFull(true);
      await API.post(`/groups/project/${projectId}/register-full-group`, {
        groupNumber: g.groupNumber,
        members: filled.map((m) => ({
          fullName: m.fullName.trim(),
          studentId: m.studentId.trim(),
          email: m.email?.trim(),
          phone: m.phone?.trim(),
          isLeader: !!m.isLeader
        }))
      });
      toast.success('Your group is registered.');
      fetchData();
    } catch (err) {
      console.error('Full group register error:', err);
    } finally {
      setSubmittingFull(false);
    }
  };

  const submitIndividual = async (e) => {
    e.preventDefault();
    try {
      setSubmittingIndiv(true);
      await API.post(`/groups/project/${projectId}/register-individual`, {
        fullName: indiv.fullName.trim(),
        studentId: indiv.studentId.trim(),
        email: indiv.email.trim(),
        phone: indiv.phone.trim()
      });
      toast.success('You have been placed in the next available group.');
      fetchData();
    } catch (err) {
      console.error('Individual register error:', err);
    } finally {
      setSubmittingIndiv(false);
    }
  };

  if (loading || !groupTable) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
          <Loader size="lg" text="Loading group assignment..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-[#f8f9fc] min-h-[calc(100vh-64px)] flex flex-col relative pb-12">
        {registrationLocked && (
          <div
            className={`mx-8 mt-6 rounded-xl border px-4 py-3 flex items-center gap-3 ${
              isPublished ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Lock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {isPublished ? 'Final groups published — view only' : 'Registration closed'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {isPublished
                  ? 'Your lecturer has published this table. Registration and edits are no longer available.'
                  : 'The registration deadline has passed. You can still view the table below.'}
              </p>
            </div>
          </div>
        )}

        <div className="px-8 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-4">
            <button
              type="button"
              onClick={() => navigate('/student/groups')}
              className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Groups
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">
              {groupTable.module}: {groupTable.assignmentTitle}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 mt-2">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Group formation</h1>
                {isPublished && <Badge variant="success">Published</Badge>}
                {!isPublished && !deadlinePassed && <Badge variant="warning">Registration open</Badge>}
                {!isPublished && deadlinePassed && <Badge variant="danger">Closed</Badge>}
              </div>
              <p className="text-gray-500 text-lg leading-relaxed">
                <span className="font-semibold text-gray-700">{groupTable.assignmentTitle}</span>
                <span className="text-gray-400"> · </span>
                Register with your group or take the next free slot. Other students&apos; contact details are hidden.
              </p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Registration deadline: {formatDate(groupTable.registrationDeadline)}
              </p>
              
              {groupTable.description && (
                <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Project description</span>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{groupTable.description}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600 mb-1">{fillPercentage}%</p>
                <p className="text-xs font-medium text-blue-400">Filled</p>
              </div>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {myGroup && (
          <div className="px-8 mb-4">
            <div className="bg-white border border-primary-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                {getGroupName(myGroup.groupNumber)}
              </div>
              <div>
                <p className="font-bold text-gray-900">You are in Group {getGroupName(myGroup.groupNumber)}</p>
                <p className="text-sm text-gray-500">You can review members in the table below.</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-8 flex-1 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex gap-3 bg-white">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search groups or names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm"
                aria-label="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-2">Group</div>
              <div className="col-span-3">Student ID</div>
              <div className="col-span-5">Member Name</div>
              <div className="col-span-2 text-right">Capacity</div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[min(60vh,520px)]">
              {filteredGroups.map((group) => {
                const filled = group.members?.length || 0;
                const cap = group.maxMembers;
                const isFull = filled === cap;
                const names = (group.members || []).map((m) => m.name || '—').join(', ') || '—';

                return (
                  <div
                    key={group._id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 items-center ${
                      isFull ? 'bg-green-50/80' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="col-span-2 font-bold text-gray-900">Group {getGroupName(group.groupNumber)}</div>
                    <div className="col-span-3 text-sm text-gray-600">
                      <ul className="space-y-1">
                        {(group.members || []).map((m, i) => (
                          <li key={i}>{m.studentId || '—'}</li>
                        ))}
                        {(group.members || []).length === 0 && <li>—</li>}
                      </ul>
                    </div>
                    <div className="col-span-5 text-sm text-gray-800 font-medium">
                      <ul className="space-y-1">
                        {(group.members || []).map((m, i) => (
                          <li key={i}>{m.name || '—'}</li>
                        ))}
                        {(group.members || []).length === 0 && <li>—</li>}
                      </ul>
                    </div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-700">
                      {filled}/{cap}
                    </div>
                  </div>
                );
              })}
              {filteredGroups.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-medium">No rows match your search.</div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-gray-900">Your module context</h3>
              </div>
              <dl className="text-sm space-y-2 text-gray-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Module</dt>
                  <dd className="font-medium text-gray-900">{groupTable.module}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Year / Sem</dt>
                  <dd className="font-medium text-gray-900">
                    {groupTable.yearLevel} · Sem {groupTable.semester}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400">Specialization</dt>
                  <dd className="font-medium text-gray-900">{groupTable.specialization}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {canRegister && !myGroup && (
          <div className="px-8 mt-10 grid grid-cols-1 xl:grid-cols-2 gap-8">
            <form
              onSubmit={submitFullGroup}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-900">Full group register</h3>
              <p className="text-sm text-gray-500">
                The group leader registers every member at once. Choose an empty group, then fill all slots.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Empty group</label>
                <select
                  value={selectedEmptyGroup}
                  onChange={(e) => setSelectedEmptyGroup(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select group…</option>
                  {emptyGroups.map((g) => (
                    <option key={g._id} value={g._id}>
                      Group {getGroupName(g.groupNumber)} ({g.maxMembers} members)
                    </option>
                  ))}
                </select>
                {emptyGroups.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No completely empty groups left. Use individual registration.</p>
                )}
              </div>
              {selectedEmptyGroup &&
                fullMembers.map((row, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50/40">
                    <p className="text-xs font-bold text-gray-500">Member {idx + 1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        label="Full name"
                        value={row.fullName}
                        onChange={(e) => handleFullRowChange(idx, 'fullName', e.target.value)}
                        required
                      />
                      <Input
                        label="Student ID"
                        value={row.studentId}
                        onChange={(e) => handleFullRowChange(idx, 'studentId', e.target.value)}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={row.email}
                        onChange={(e) => handleFullRowChange(idx, 'email', e.target.value)}
                      />
                      <Input
                        label="Phone"
                        value={row.phone}
                        onChange={(e) => handleFullRowChange(idx, 'phone', e.target.value)}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="leader"
                        checked={row.isLeader}
                        onChange={() => handleLeaderRadio(idx)}
                      />
                      Group leader
                    </label>
                  </div>
                ))}
              <Button type="submit" fullWidth disabled={submittingFull || !selectedEmptyGroup}>
                {submittingFull ? 'Submitting…' : 'Register entire group'}
              </Button>
            </form>

            <form
              onSubmit={submitIndividual}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-900">Individual slot</h3>
              <p className="text-sm text-gray-500">
                Register only yourself. You will be placed in the next available slot across groups.
              </p>
              <Input
                label="Full name"
                value={indiv.fullName}
                onChange={(e) => setIndiv((p) => ({ ...p, fullName: e.target.value }))}
                required
              />
              <Input
                label="Student ID"
                value={indiv.studentId}
                onChange={(e) => setIndiv((p) => ({ ...p, studentId: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={indiv.email}
                onChange={(e) => setIndiv((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <Input
                label="Phone"
                value={indiv.phone}
                onChange={(e) => setIndiv((p) => ({ ...p, phone: e.target.value }))}
              />
              <Button type="submit" fullWidth disabled={submittingIndiv}>
                {submittingIndiv ? 'Submitting…' : 'Join next available slot'}
              </Button>
            </form>
          </div>
        )}

        {canRegister && myGroup && (
          <div className="px-8 mt-8 text-center text-sm text-gray-500">
            You are already assigned to a group for this table.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentGroupTable;

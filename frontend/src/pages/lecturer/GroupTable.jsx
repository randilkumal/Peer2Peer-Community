// LecturerGroupTable.jsx
// Component: Lecturer Group Table
// Purpose: Displays a detailed view of a specific group assignment for a lecturer.
//          Shows all groups, their members, capacity stats, and registration deadline.
// Author: [Your Name]
// Last Modified: [Date]

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { ChevronRight, Search, Filter, Users, ArrowLeft, CalendarClock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const LecturerGroupTable = () => {
  // Extract the project ID from the URL params (e.g. /groups/:id)
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  // loading: true while fetching project data from the API
  const [loading, setLoading] = useState(true);

  // groupTable: metadata about the assignment (title, module, deadline, etc.)
  const [groupTable, setGroupTable] = useState(null);

  // groups: array of group objects, each containing members and capacity info
  const [groups, setGroups] = useState([]);

  // searchQuery: filters groups/members in the table in real time
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch project details and its groups when the component mounts or projectId changes
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/groups/project/${projectId}`);
        setGroupTable(res.data.groupTable);
        setGroups(res.data.groups || []); // Fallback to empty array if no groups exist yet
      } catch (error) {
        console.error('Error fetching group details:', error);
        navigate('/groups'); // Redirect back to list if the project doesn't exist or fails
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if a valid projectId is available
    if (projectId) {
      fetchProject();
    }
  }, [projectId, navigate]);

  // Converts a group number to a label using letters: 1 → "Group A", 2 → "Group B", etc.
  const getGroupLabel = (number) => `Group ${String.fromCharCode(64 + (number || 0))}`;

  // Filter groups by group label OR any member's name — used for the search bar
  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase();
    const title = getGroupLabel(group.groupNumber).toLowerCase();
    if (title.includes(query)) return true;
    // Also match against each member's name (supports both populated and unpopulated refs)
    return (group.members || []).some((member) => {
      const name = member.name || member.user?.fullName || '';
      return name.toLowerCase().includes(query);
    });
  });

  // Show a full-page loader while data is being fetched
  if (loading || !groupTable) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
          <Loader size="lg" text="Loading group details..." />
        </div>
      </DashboardLayout>
    );
  }

  // ── Derived stats for the sidebar cards ────────────────────────────────────
  const totalCapacity = groupTable.numberOfGroups * groupTable.groupSize;
  const totalAssigned = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
  // Fill percentage shown in the capacity progress bar
  const fillPercent = totalCapacity ? Math.round((totalAssigned / totalCapacity) * 100) : 0;
  // Deadline check: used to show "Closed" badge and deadline message
  const deadlinePassed = new Date() > new Date(groupTable.registrationDeadline);

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col gap-6">

        {/* ── Page Header: Back button, title, and status badge ────────────── */}
        <div className="flex items-center justify-between gap-4">
          {/* Back button returns lecturer to the group assignments list */}
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Assignment title and module/year/semester summary */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">{groupTable.assignmentTitle}</h1>
            <p className="text-sm text-gray-500">
              {groupTable.module} • Year {groupTable.yearLevel} • Sem {groupTable.semester}
            </p>
          </div>

          {/* Status badge: "Published" > "Closed" (deadline passed) > "Open" */}
          <Badge variant={groupTable.status === 'published' ? 'success' : deadlinePassed ? 'danger' : 'warning'}>
            {groupTable.status === 'published' ? 'Published' : deadlinePassed ? 'Closed' : 'Open'}
          </Badge>
        </div>

        {/* ── Main Content: Group table (left) + Sidebar cards (right) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Group Table Panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Search bar and filter button */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups or students..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {/* Filter button — placeholder for future filter functionality */}
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            {/* Table column headers */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <div className="col-span-2">Group</div>
              <div className="col-span-3">Student ID</div>
              <div className="col-span-5">Member</div>
              <div className="col-span-2 text-right">Capacity</div>
            </div>

            {/* Group rows — each row lists all members of one group */}
            <div className="divide-y divide-gray-100">
              {filteredGroups.length === 0 ? (
                // Empty state when no groups match the search query
                <div className="p-10 text-center text-gray-500">No matching groups or members found.</div>
              ) : (
                filteredGroups.map((group) => {
                  const assigned = group.members?.length || 0;
                  return (
                    <div key={group._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-start hover:bg-gray-50">
                      {/* Group label (e.g. "Group A") */}
                      <div className="col-span-2 font-semibold text-gray-900">{getGroupLabel(group.groupNumber)}</div>

                      {/* Student IDs — supports both populated and unpopulated user refs */}
                      <div className="col-span-3 text-sm text-gray-600">
                        <ul className="space-y-1">
                          {group.members?.length > 0 ? group.members.map((member, index) => (
                            <li key={index}>{member.studentId || member.user?.studentId || '—'}</li>
                          )) : <li>—</li>}
                        </ul>
                      </div>

                      {/* Member full names — same dual-ref pattern as student IDs */}
                      <div className="col-span-5 text-sm text-gray-800">
                        <ul className="space-y-1">
                          {group.members?.length > 0 ? group.members.map((member, index) => (
                            <li key={index}>{member.name || member.user?.fullName || '—'}</li>
                          )) : <li>—</li>}
                        </ul>
                      </div>

                      {/* Assigned/max capacity for this specific group */}
                      <div className="col-span-2 text-right text-sm font-semibold text-gray-900">
                        {assigned}/{group.maxMembers}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Sidebar Cards ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Card 1: Overall capacity progress bar */}
            <Card>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Capacity</p>
                  <span className="text-sm font-semibold text-gray-900">{totalAssigned}/{totalCapacity}</span>
                </div>
                {/* Progress bar width is driven by fillPercent (0–100) */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: `${fillPercent}%` }} />
                </div>
                <p className="text-xs text-gray-500">{fillPercent}% of all available group slots are filled.</p>
              </div>
            </Card>

            {/* Card 2: Registration deadline with open/closed status message */}
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <CalendarClock className="w-4 h-4" />
                  <span>Registration deadline</span>
                </div>
                <p className="text-gray-900 font-semibold">{formatDate(groupTable.registrationDeadline)}</p>
                <div className="text-sm text-gray-500">
                  {/* Message changes based on whether the deadline has passed */}
                  {deadlinePassed ? 'Registration has closed.' : 'Students can still join before this deadline.'}
                </div>
              </div>
            </Card>

            {/* Card 3: Assignment metadata (module, year, semester, specialization) */}
            <Card>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Users className="w-4 h-4" />
                  <span>Table details</span>
                </div>
                <div className="grid gap-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Module</span><span>{groupTable.module}</span></div>
                  <div className="flex justify-between"><span>Year</span><span>{groupTable.yearLevel}</span></div>
                  <div className="flex justify-between"><span>Semester</span><span>{groupTable.semester}</span></div>
                  <div className="flex justify-between"><span>Specialization</span><span>{groupTable.specialization}</span></div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerGroupTable;
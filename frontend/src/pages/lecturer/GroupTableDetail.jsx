import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  ChevronRight, Search, Filter, MoreVertical, 
  Sparkles, Check, AlertCircle, UploadCloud, Trash2, CalendarClock
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { exportGroupsToExcel } from '../../utils/excelExport';
import Button from '../../components/common/Button';
import { DownloadCloud, Edit2, Save, X, CalendarClock as CalendarIcon } from 'lucide-react';
import { YEAR_LEVELS, SEMESTERS, SPECIALIZATIONS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const GroupTableDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [groups, setGroups] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  
  const [assignStrategy, setAssignStrategy] = useState('random');
  const [assigning, setAssigning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for the manual dropdowns mapping student ID to selected group ID
  const [assigningStudentId, setAssigningStudentId] = useState(null);
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState(null);
  const [savingMetadata, setSavingMetadata] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectRes, unassignedRes] = await Promise.all([
        API.get(`/groups/project/${id}`),
        API.get(`/groups/project/${id}/unassigned`)
      ]);
      setProject(projectRes.data.groupTable);
      setGroups(projectRes.data.groups);
      setUnassigned(unassignedRes.data.unassigned);
    } catch (error) {
      console.error('Error fetching group details:', error);
      navigate('/lecturer/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    try {
      setAssigning(true);
      await API.post(`/groups/project/${id}/auto-assign`, { strategy: assignStrategy });
      toast.success('Auto-assignment completed successfully!');
      fetchData();
    } catch (error) {
      console.error('Auto assign error:', error);
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssign = async (studentId, groupId) => {
    if (!groupId) return;
    try {
      toast.loading('Assigning student...', { id: 'assign' });
      await API.post(`/groups/${groupId}/assign`, {
        studentId: studentId,
        joinMethod: 'manual'
      });
      toast.success('Student assigned successfully!', { id: 'assign' });
      setAssigningStudentId(null);
      fetchData();
    } catch (error) {
      console.error('Manual assign error:', error);
      toast.dismiss('assign');
    }
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    if (!window.confirm('Remove this student from the group?')) return;
    try {
      toast.loading('Removing student...', { id: 'remove' });
      await API.delete(`/groups/${groupId}/remove/${studentId}`);
      toast.success('Student removed from group.', { id: 'remove' });
      fetchData();
    } catch (error) {
      console.error('Remove student error:', error);
      toast.dismiss('remove');
    }
  };

  const handlePublish = async () => {
    if (unassigned.length > 0) {
      const confirm = window.confirm(`There are ${unassigned.length} unassigned students. Do you still want to publish?`);
      if (!confirm) return;
    } else {
      const confirm = window.confirm('Are you ready to publish these groups to students?');
      if (!confirm) return;
    }

    try {
      setPublishing(true);
      await API.patch(`/groups/project/${id}/publish`);
      toast.success('Groups published successfully!');
      fetchData();
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteAssignment = async () => {
    const ok = window.confirm(
      `Delete "${project.assignmentTitle}"? All groups and registrations for this assignment will be removed permanently.`
    );
    if (!ok) return;
    try {
      setDeletingAssignment(true);
      await API.delete(`/groups/project/${id}`);
      toast.success('Assignment deleted.');
      navigate('/lecturer/groups');
    } catch (error) {
      console.error('Delete assignment error:', error);
    } finally {
      setDeletingAssignment(false);
    }
  };

  const handleExportExcel = () => {
    exportGroupsToExcel(project, groups);
  };

  const startEditingMetadata = () => {
    setEditedMetadata({
      assignmentTitle: project.assignmentTitle,
      description: project.description || '',
      registrationDeadline: project.registrationDeadline ? new Date(project.registrationDeadline).toISOString().split('T')[0] : '',
      academicYear: project.academicYear,
      period: project.period,
      yearLevel: project.yearLevel,
      semester: project.semester,
      specialization: project.specialization
    });
    setIsEditingMetadata(true);
  };

  const handleMetadataChange = (e) => {
    const { name, value, type } = e.target;
    setEditedMetadata(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const saveMetadata = async () => {
    try {
      setSavingMetadata(true);
      await API.post(`/groups/project-metadata/${id}`, editedMetadata);
      toast.success('Assignment details updated!');
      setIsEditingMetadata(false);
      fetchData();
    } catch (error) {
      console.error('Save metadata error:', error);
      toast.error('Failed to update details');
    } finally {
      setSavingMetadata(false);
    }
  };

  if (loading || !project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
          <Loader size="lg" text="Loading group dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  // Derived stats
  const totalCapacity = project.numberOfGroups * project.groupSize;
  const totalAssigned = groups.reduce((acc, g) => acc + g.members.length, 0);
  const fillPercentage = Math.round((totalAssigned / totalCapacity) * 100);
  const isPublished = project.status === 'published';

  // Number to letter converter for Group Names (e.g. 1 -> A, 2 -> B)
  const getGroupName = (num) => String.fromCharCode(64 + num);

  // Avatar generator
  const renderAvatar = (name, index) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
    const colorClass = colors[index % colors.length];
    return (
      <div 
        key={index} 
        className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold -ml-2 first:ml-0 shadow-sm ${colorClass}`}
        title={name}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Filter groups
  const filteredGroups = groups.filter(g => 
    `Group ${getGroupName(g.groupNumber)}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.members.some(m => {
      const studentName = m.user?.fullName || m.name || '';
      return studentName.toLowerCase().includes(searchQuery.toLowerCase());
    })
  );

  return (
    <DashboardLayout>
      <div className="bg-[#f8f9fc] min-h-[calc(100vh-64px)] flex flex-col relative pb-24">
        
        {/* TOP HEADER */}
        <div className="px-8 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
            <span className="cursor-pointer hover:text-gray-900" onClick={() => navigate('/lecturer/modules')}>Modules</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{project.module}: {project.assignmentTitle}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 mt-4">
            <div className="flex-1">
              {isEditingMetadata ? (
                <div className="mb-4">
                  <Input
                    label="Assignment Title"
                    name="assignmentTitle"
                    value={editedMetadata.assignmentTitle}
                    onChange={handleMetadataChange}
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Group Formation</h1>
                  <p className="text-gray-500 text-lg leading-relaxed mb-4">
                    Manage student project assignments for the <span className="font-semibold text-gray-700">{project.assignmentTitle}</span>.
                  </p>
                </>
              )}

              {/* DETAILS SECTION */}
              <div className="flex flex-wrap gap-y-4 gap-x-8 mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                {isEditingMetadata ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                    <Select
                      label="Academic Year"
                      name="academicYear"
                      value={editedMetadata.academicYear}
                      onChange={handleMetadataChange}
                      options={[2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }))}
                    />
                    <Select
                      label="Period"
                      name="period"
                      value={editedMetadata.period}
                      onChange={handleMetadataChange}
                      options={[
                        { value: 'Jan-May', label: 'Jan-May' },
                        { value: 'Jun-Nov', label: 'Jun-Nov' }
                      ]}
                    />
                    <Select
                      label="Year Level"
                      name="yearLevel"
                      value={editedMetadata.yearLevel}
                      onChange={handleMetadataChange}
                      options={YEAR_LEVELS.map(y => ({ value: y, label: `Year ${y}` }))}
                    />
                    <Select
                      label="Semester"
                      name="semester"
                      value={editedMetadata.semester}
                      onChange={handleMetadataChange}
                      options={SEMESTERS.map(s => ({ value: s, label: `Semester ${s}` }))}
                    />
                    <Select
                      label="Specialization"
                      name="specialization"
                      value={editedMetadata.specialization}
                      onChange={handleMetadataChange}
                      options={[
                        { value: 'All', label: 'All Specializations' },
                        ...SPECIALIZATIONS.map(s => ({ value: s, label: s }))
                      ]}
                    />
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                      <input
                        type="date"
                        name="registrationDeadline"
                        value={editedMetadata.registrationDeadline}
                        onChange={handleMetadataChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic context</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                          Year {project.yearLevel}
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                          Sem {project.semester}
                        </span>
                        <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100">
                          {project.period}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Specialization</span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 w-fit">
                        {project.specialization === 'All' ? 'All Specializations' : project.specialization}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</span>
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold text-xs">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {formatDate(project.registrationDeadline)}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                      <div className="flex items-center gap-1.5">
                        {isPublished ? (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">Published</span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">Draft / Open</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isEditingMetadata ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-bold uppercase tracking-wider text-[10px]">Project description</label>
                  <textarea
                    name="description"
                    value={editedMetadata.description}
                    onChange={handleMetadataChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm italic"
                    placeholder="Provide details about the assignment..."
                  ></textarea>
                </div>
              ) : (
                project.description && (
                  <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Project description</span>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{project.description}"
                    </p>
                  </div>
                )
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {isEditingMetadata ? (
                  <>
                    <Button onClick={saveMetadata} loading={savingMetadata} icon={Save}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingMetadata(false)} icon={X}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={startEditingMetadata}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit details
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAssignment}
                      disabled={deletingAssignment}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingAssignment ? 'Deleting…' : 'Delete assignment'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-secondary-200 text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  <DownloadCloud className="w-4 h-4" />
                  Download as Excel
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600 mb-1">{fillPercentage}%</p>
                <p className="text-xs font-medium text-blue-400">Formed</p>
              </div>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT SPLIT */}
        <div className="px-8 flex-1 flex flex-col lg:flex-row gap-8">
          
          {/* LEFT PANE - GROUPS LIST */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 flex gap-3 bg-white">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search groups or members..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Group ID</div>
              <div className="col-span-3">Members</div>
              <div className="col-span-3">Capacity</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Act</div>
            </div>

            {/* Group Rows */}
            <div className="flex-1 overflow-y-auto">
              {filteredGroups.map(group => {
                const filledCount = group.members.length;
                const capacityRatio = filledCount / project.groupSize;
                const isEmpty = filledCount === 0;
                const isFull = filledCount === project.groupSize;
                
                let statusBadge = <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 uppercase">Empty</span>;
                let barColor = 'bg-gray-200';
                
                if (isFull) {
                  statusBadge = <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200 uppercase tracking-wide">Full</span>;
                  barColor = 'bg-green-500';
                } else if (!isEmpty) {
                  statusBadge = <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 uppercase tracking-wide">Partial</span>;
                  barColor = 'bg-orange-500';
                }

                // Generate empty slots avatars
                const emptySlots = project.groupSize - filledCount;

                return (
                  <div key={group._id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors group/row">
                    {/* Column 1: ID */}
                    <div className="col-span-3">
                      <p className="font-bold text-gray-900 text-base">Group {getGroupName(group.groupNumber)}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">Created Oct 12</p>
                    </div>
                    
                    {/* Column 2: Members */}
                    <div className="col-span-3 flex items-center">
                      <div className="flex items-center">
                        {group.members.map((m, i) => renderAvatar(m.user?.fullName || m.name || 'S', i))}
                        {Array.from({ length: emptySlots }).map((_, i) => (
                          <div 
                            key={`empty-${i}`} 
                            className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center -ml-2 first:ml-0 bg-gray-50 text-gray-300 font-bold"
                          >
                            +
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Column 3: Capacity */}
                    <div className="col-span-3 flex items-center gap-3">
                      <span className={`font-bold text-sm ${isFull ? 'text-green-600' : isEmpty ? 'text-gray-400' : 'text-orange-500'}`}>
                        {filledCount}/{project.groupSize}
                      </span>
                      <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${barColor}`} 
                          style={{ width: `${capacityRatio * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Column 4: Status */}
                    <div className="col-span-2 flex items-center">
                      {statusBadge}
                    </div>
                    
                    {/* Column 5: Actions */}
                    <div className="col-span-1 flex justify-end relative">
                      {/* For now just a dropdown placeholder for removing students, but UI focuses on assigning unassigned */}
                      <button className="p-2 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {filteredGroups.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">No groups found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE - SIDEBAR */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-6">
            
            {/* Unregistered Students Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col max-h-[500px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 text-lg tracking-tight">Unregistered Students</h3>
                <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 uppercase tracking-wide">
                  {unassigned.length} Left
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Click a student to manually place them in a specific group slot.
              </p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {unassigned.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-10 h-10 text-green-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-900">All set!</p>
                    <p className="text-xs text-gray-500 mt-1">Every student is assigned.</p>
                  </div>
                ) : (
                  unassigned.map((student, idx) => (
                    <div key={student._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50/30 group">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {renderAvatar(student.fullName, idx + 5)}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{student.fullName}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                            {student.studentId} • {project.specialization === 'All' ? 'General' : project.specialization}
                          </p>
                        </div>
                      </div>
                      
                      {/* Manual Assign Select Logic */}
                      {assigningStudentId === student._id ? (
                        <select 
                          className="text-xs border border-blue-200 bg-blue-50 text-blue-700 rounded-lg p-1.5 focus:outline-none"
                          autoFocus
                          onBlur={() => setAssigningStudentId(null)}
                          onChange={(e) => handleManualAssign(student._id, e.target.value)}
                        >
                          <option value="">Group...</option>
                          {groups.map(g => (
                            <option key={g._id} value={g._id} disabled={g.members.length >= project.groupSize}>
                              {getGroupName(g.groupNumber)} ({g.members.length}/{project.groupSize})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button 
                          onClick={() => setAssigningStudentId(student._id)}
                          className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Auto Assign Strategy Card */}
            <div className="bg-[#eff4fb] rounded-2xl border border-blue-100 p-5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900 text-base">Auto-Assign Strategy</h3>
              </div>
              <p className="text-sm text-blue-800/80 mb-4 leading-relaxed relative z-10">
                The algorithm will instantly prioritize balanced allocations across all open slots.
              </p>
              
              <div className="space-y-3 relative z-10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${assignStrategy === 'random' ? 'bg-blue-600' : 'bg-white border border-blue-200'}`}>
                    {assignStrategy === 'random' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                  <input type="radio" value="random" className="hidden" checked={assignStrategy === 'random'} onChange={() => setAssignStrategy('random')} />
                  <span className="text-sm font-semibold text-blue-900">Randomized Mix</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${assignStrategy === 'sequential' ? 'bg-blue-600' : 'bg-white border border-blue-200'}`}>
                    {assignStrategy === 'sequential' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                  <input type="radio" value="sequential" className="hidden" checked={assignStrategy === 'sequential'} onChange={() => setAssignStrategy('sequential')} />
                  <span className="text-sm font-semibold text-blue-900">Sequential Fill Strategy</span>
                </label>
              </div>
              
              {/* Decorative background shape */}
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/5 rounded-tl-full -mr-8 -mb-8 z-0"></div>
            </div>

          </div>
        </div>

        {/* BOTTOM FIXED BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-30 lg:pl-[280px]">
          <div className="px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-gray-900 text-sm">
                Total Progress: <span className="text-black">{totalAssigned}/{totalCapacity} Slots Finalized</span>
              </p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {isPublished ? 'This table is published to students.' : 'Published groups will be notified immediately.'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {!isPublished && (
                <>
                  <button 
                    onClick={handleAutoAssign}
                    disabled={assigning || unassigned.length === 0}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-primary-500 text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" /> Auto-Assign
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    <UploadCloud className="w-5 h-5" /> 
                    Confirm & Publish Final Groups
                  </button>
                </>
              )}
              {isPublished && (
                <button 
                  onClick={handleExportExcel}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  <DownloadCloud className="w-5 h-5" /> 
                  Export Groups as Excel
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default GroupTableDetail;

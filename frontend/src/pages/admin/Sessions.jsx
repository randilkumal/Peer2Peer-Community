//sessions page for admin to view all sessions, filter by status, and click into details
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import API from '../../utils/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  History,
  Plus,
  UserCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminSessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('announcements');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [sessions, setSessions] = useState({
    announcements: [],
    pending: [],
    completed: [],
    cancelled: [],
    sessionRequestHistory: []
  });
  const [modules, setModules] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    fetchSessions();
    fetchModules();
  }, [activeTab]);

  const fetchModules = async () => {
    try {
      const res = await API.get('/modules');
      setModules(res.data.modules || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    try {
      await API.delete(`/session-requests/${requestToDelete._id}`);
      toast.success('Session request deleted successfully');
      fetchSessions();
    } catch (e) {
      toast.error('Failed to delete session request');
    } finally {
      setDeleteModalOpen(false);
      setRequestToDelete(null);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      if (activeTab === 'announcements') {
        const res = await API.get('/sessions?status=requested');
        setSessions(prev => ({ ...prev, announcements: res.data.sessions || [] }));
      } else if (activeTab === 'pending') {
        const res = await API.get('/sessions?status=pending');
        setSessions(prev => ({ ...prev, pending: res.data.sessions || [] }));
      } else if (activeTab === 'completed') {
        const res = await API.get('/sessions?status=completed');
        setSessions(prev => ({ ...prev, completed: res.data.sessions || [] }));
      } else if (activeTab === 'cancelled') {
        const res = await API.get('/sessions?status=cancelled');
        setSessions(prev => ({ ...prev, cancelled: res.data.sessions || [] }));
      } else if (activeTab === 'session-request-history') {
        const res = await API.get('/session-requests');
        setSessions(prev => ({ ...prev, sessionRequestHistory: res.data.sessionRequests || [] }));
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    let list = sessions[activeTab] || [];
    if (activeTab === 'session-request-history') {
      return list; // session requests - no session-style filtering
    }
    if (searchQuery) {
      list = list.filter(s =>
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterModule) {
      list = list.filter(s => s.moduleCode === filterModule);
    }
    return list;
  };

  const sessionRequests = sessions.sessionRequestHistory || [];

  const tabs = [
    { id: 'announcements', label: 'Session Announcements', icon: FileText },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
    { id: 'session-request-history', label: 'Request Session History', icon: MessageSquare }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-600 mt-1">Manage session announcements and requests</p>
          </div>
          <Button icon={Plus} onClick={() => navigate('/admin/sessions/create')}>
            Create Session Announcement
          </Button>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Modules</option>
              {modules.map(m => (
                <option key={m.code} value={m.code}>{m.code}</option>
              ))}
            </select>
          </div>
        </Card>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap font-medium ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="Loading..." />
          </div>
        ) : activeTab === 'session-request-history' ? (
          sessionRequests.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No session requests yet</h3>
                <p className="text-gray-600 mb-4">Students and experts can request new sessions from the Request Session form. Their messages will appear here.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessionRequests.map((req) => (
                <Card key={req._id} className="border-l-4 border-l-primary-500">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{req.user?.fullName || 'Unknown'}</span>
                        <span className="text-sm text-gray-500">({req.user?.email})</span>
                        <Badge
                          variant={req.messageStatus === 'seen' ? 'success' : 'default'}
                          size="sm"
                        >
                          {req.messageStatus === 'seen' ? 'Message seen' : 'Delivered'}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{req.topic}</p>
                      {req.moduleCode && (
                        <p className="text-sm text-primary-600 mb-1">Module: {req.moduleCode}</p>
                      )}
                      <p className="text-gray-600 text-sm">{req.reason}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(req.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {req.messageStatus !== 'seen' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await API.patch(`/session-requests/${req._id}/message-status`);
                              toast.success('Marked as seen');
                              fetchSessions();
                            } catch (e) {
                              toast.error('Failed to update message status');
                            }
                          }}
                        >
                          Mark as seen
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setRequestToDelete(req);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : getFilteredSessions().length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'announcements' && 'No session announcements'}
                {activeTab === 'pending' && 'No pending sessions'}
                {activeTab === 'completed' && 'No completed sessions'}
                {activeTab === 'cancelled' && 'No cancelled sessions'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'announcements' && 'Create a session announcement to get started'}
                {activeTab === 'pending' && 'Sessions that have been scheduled will appear here'}
                {activeTab === 'cancelled' && 'Cancelled sessions will appear here'}
              </p>
              {activeTab === 'announcements' && (
                <Button icon={Plus} onClick={() => navigate('/admin/sessions/create')}>
                  Create Session Announcement
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredSessions().map((session) => (
              <Card
                key={session._id}
                hover
                className="cursor-pointer"
                onClick={() => navigate(`/admin/sessions/${session._id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{session.title}</h3>
                    <Badge variant="primary-outline" size="sm">{session.moduleCode}</Badge>
                    <Badge variant={
                      session.status === 'requested' ? 'info' :
                      session.status === 'cancelled' ? 'danger' :
                      session.status === 'completed' ? 'default' : 'success'
                    } className="ml-2">
                      {session.status === 'requested' ? 'Announcement' : session.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{session.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {session.participants?.length || 0} / {session.requiredStudents}
                  </span>
                  {session.expert && (
                    <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3" /> Expert assigned</Badge>
                  )}
                  {!session.expert && session.pendingRequests?.some(r => r.role === 'expert' && r.status === 'pending') && (
                    <Badge variant="warning" size="sm"><UserCheck className="w-3 h-3" /> Expert Requested</Badge>
                  )}
                </div>
                {session.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.date)}
                    {session.startTime && ` • ${session.startTime}`}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/sessions/${session._id}`)}>
                    View / Edit
                  </Button>
                  <Button size="sm" onClick={() => navigate(`/admin/sessions/${session._id}/edit`)}>
                    Edit Details
                  </Button>
                  {activeTab === 'announcements' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        try {
                          await API.patch(`/sessions/${session._id}/cancel`);
                          toast.success('Announcement cancelled');
                          fetchSessions();
                        } catch (e) {
                          toast.error('Failed to cancel');
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRequestToDelete(null);
        }}
        title="Delete Session Request"
        message="Are you sure you want to delete this session request? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteRequest}
      />
    </DashboardLayout>
  );
};

export default AdminSessions;

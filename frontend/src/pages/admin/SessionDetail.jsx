import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  XCircle as XCircleIcon
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminSessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSession = async () => {
    try {
      const res = await API.get(`/sessions/${id}`);
      setSession(res.data.session);
    } catch (e) {
      toast.error('Failed to load session');
      navigate('/admin/sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleCancelSession = async () => {
    try {
      setActionLoading('cancel');
      await API.patch(`/sessions/${id}/cancel`);
      toast.success('Session cancelled');
      fetchSession();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      setActionLoading('complete');
      await API.patch(`/sessions/${id}/complete`);
      toast.success('Marked as completed');
      fetchSession();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex justify-center">
          <Loader size="lg" text="Loading session..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="p-8">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/sessions')} className="mb-6">
          Back to Sessions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="primary-outline">{session.moduleCode}</Badge>
                    <Badge variant={
                      session.status === 'requested' ? 'warning' :
                      session.status === 'completed' ? 'default' :
                      session.status === 'cancelled' ? 'danger' : 'success'
                    }>
                      {session.status}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" icon={Edit} onClick={() => navigate(`/admin/sessions/${id}/edit`)}>
                  Edit
                </Button>
              </div>
              <p className="text-gray-600 whitespace-pre-line mb-4">{session.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {session.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(session.date)}
                  </div>
                )}
                {session.startTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {session.startTime} - {session.endTime || 'TBA'}
                  </div>
                )}
                {session.isOnline ? (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-500" />
                    Online
                    {session.meetingLink && (
                      <a href={session.meetingLink} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                        Join
                      </a>
                    )}
                  </div>
                ) : session.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {session.venue}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  {session.participants?.length || 0} / {session.requiredStudents} students
                  {session.expert && (
                    <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3" /> Expert assigned</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Join requests removed: joining is instant now */}
          </div>

          <div>
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button fullWidth variant="outline" onClick={() => navigate(`/admin/sessions/${id}/edit`)}>
                  Edit Session
                </Button>
                {session.status !== 'cancelled' && session.status !== 'completed' && (
                  <Button
                    fullWidth
                    variant="danger"
                    icon={XCircleIcon}
                    onClick={handleCancelSession}
                    loading={actionLoading === 'cancel'}
                  >
                    Cancel Session
                  </Button>
                )}
                {session.status === 'pending' && (
                  <Button
                    fullWidth
                    onClick={handleMarkCompleted}
                    loading={actionLoading === 'complete'}
                  >
                    Mark Completed
                  </Button>
                )}
                <Button fullWidth onClick={() => navigate('/admin/sessions')}>
                  Back to List
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSessionDetail;

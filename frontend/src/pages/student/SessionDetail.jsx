import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import API from '../../utils/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Users,
  Video,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Award,
  TrendingUp,
  BookOpen,
  Send,
  MessageSquare
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const SessionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const fetchSessionDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await API.get(`/sessions/${id}`);
      setSession(response.data.session);
      fetchReviews(id);
    } catch (error) {
      toast.error('Failed to load session details');
      console.error('Error fetching session:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchReviews = async (sessionId) => {
    try {
      setLoadingReviews(true);
      const res = await API.get(`/reviews/session/${sessionId}/expert`);
      setReviews(res.data.reviews || []);
    } catch (e) {
      console.error('Failed to load reviews', e);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleJoinSession = async () => {
    try {
      setActionLoading(true);
      await API.post(`/sessions/${id}/join`, {
        role: 'student'
      });
      toast.success('Joined session successfully!');
      fetchSessionDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      await API.post(`/sessions/${id}/withdraw`);
      toast.success('Withdrawn from session successfully');
      setShowWithdrawModal(false);
      fetchSessionDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRateExpert = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    const expertId = session.expert?._id || session.expert;
    const sessionId = session._id || session.id;
    if (!expertId || !sessionId) {
      toast.error('Missing session or expert. Refresh the page and try again.');
      return;
    }

    try {
      setRatingSubmitLoading(true);
      await API.post('/reviews/expert', {
        expertId: String(expertId),
        sessionId: String(sessionId),
        rating: Number(rating),
        comment: ratingComment
      });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
      await fetchSessionDetails(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitLoading(false);
    }
  };

  const isUserJoined = () => {
    const isParticipant = session?.participants?.some(p => String(p._id || p) === String(user?._id));
    const isExpert = String(session?.expert?._id || session?.expert) === String(user?._id);
    return isParticipant || isExpert;
  };

  const hasPendingRequest = () => {
    return session?.pendingRequests?.some(r => {
      const rUserId = r.user?._id || r.user;
      return rUserId && String(rUserId) === String(user?._id) && r.status === 'pending';
    });
  };

  const canJoin = () => {
    if (!session) return false;
    if (session.status === 'cancelled') return false;
    if (session.status === 'completed') return false;
    if (isUserJoined()) return false;
    if (hasPendingRequest()) return false;
    const spotsLeft = (session.maxParticipants || 25) - (session.participants?.length || 0);
    return spotsLeft > 0;
  };

  const getStatusBadge = () => {
    if (!session) return null;

    if (session.status === 'completed') {
      return <Badge variant="default">Completed</Badge>;
    }
    if (session.status === 'cancelled') {
      return <Badge variant="danger">Cancelled</Badge>;
    }
    if (session.status === 'confirmed') {
      return <Badge variant="success">Confirmed</Badge>;
    }
    if (isUserJoined()) {
      return <Badge variant="success">You're Joined</Badge>;
    }
    if (hasPendingRequest()) {
      return <Badge variant="warning">Request Pending</Badge>;
    }
    return <Badge variant="info">Open for Registration</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading session details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Session Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The session you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/student/sessions')}>
                Back to Sessions
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const spotsLeft = (session.maxParticipants || 25) - (session.participants?.length || 0);
  const progressPercentage = ((session.participants?.length || 0) / (session.maxParticipants || 25)) * 100;

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          icon={ArrowLeft}
          onClick={() => navigate('/student/sessions')}
          className="mb-6"
        >
          Back to Sessions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info Card */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {session.status === 'completed' && (
                    <div className="mb-4 py-2 px-4 bg-gray-100 border border-gray-200 rounded-lg flex items-center gap-2 text-gray-700 font-medium animate-in fade-in slide-in-from-top-1 duration-500">
                      <CheckCircle className="w-5 h-5 text-gray-500" />
                      This session concluded on {session.completedAt ? formatDate(session.completedAt) : formatDate(session.date)}.
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {session.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary-outline">
                      {session.moduleCode || session.module?.code}
                    </Badge>
                    {getStatusBadge()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {session.description || 'No description provided.'}
                </p>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {session.date ? formatDate(session.date) : 'To be announced'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">
                        {session.startTime ? `${session.startTime} - ${session.endTime || 'TBA'}` : 'To be announced'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      {session.isOnline ? (
                        <Video className="w-5 h-5 text-primary-600" />
                      ) : (
                        <MapPin className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {session.isOnline ? 'Online Meeting' : 'Venue'}
                      </p>
                      <p className="font-medium text-gray-900">
                        {session.isOnline ? 'Online Session' : session.venue || 'To be announced'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Participants</p>
                      <p className="font-medium text-gray-900">
                        {session.participants?.length || 0} / {session.maxParticipants || 25}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {session.status === 'completed' ? 'Final Attendance' : 'Registration Progress'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {session.status === 'completed' ? `${session.participants?.length || 0} students attended` : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      session.status === 'completed' ? 'bg-red-600' :
                      progressPercentage >= 90 ? 'bg-red-500' : 
                      progressPercentage >= 70 ? 'bg-yellow-500' : 
                      'bg-primary-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Meeting Link (if online and user joined and NOT completed) */}
              {session.isOnline && session.meetingLink && isUserJoined() && session.status !== 'completed' && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 mb-1">Online Meeting Link</p>
                      <p className="text-sm text-blue-700 mb-3">
                        Join the session using the link below when it starts
                      </p>
                      <Button 
                        size="sm"
                        icon={Video}
                        onClick={() => window.open(session.meetingLink, '_blank')}
                      >
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-3">
                {canJoin() && (
                  <Button 
                    icon={Send}
                    onClick={handleJoinSession}
                    loading={actionLoading}
                    fullWidth
                  >
                    Join Session
                  </Button>
                )}

                {isUserJoined() && session.status !== 'cancelled' && session.status !== 'completed' && (
                  <Button 
                    variant="success"
                    icon={CheckCircle}
                    disabled
                    fullWidth
                  >
                    You're Registered
                  </Button>
                )}

                {hasPendingRequest() && (
                  <Button 
                    variant="warning"
                    icon={Clock}
                    disabled
                    fullWidth
                  >
                    Request Pending
                  </Button>
                )}

                {isUserJoined() && session.status === 'completed' && !session.userRated && (
                  <Button 
                    icon={Star}
                    onClick={() => setShowRatingModal(true)}
                    fullWidth
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    Rate This Session ⭐
                  </Button>
                )}

                {isUserJoined() && session.status === 'completed' && session.userRated && (
                   <div className="py-3 px-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      Session Completed & Rated
                   </div>
                )}
              </div>
            </Card>

              {/* Materials/Resources */}
            {session.materials && session.materials.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Session Materials
                </h3>
                <div className="space-y-3">
                  {session.materials.map((material, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {material.name || `Material ${index + 1}`}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Expert Info Card (for non-completed sessions or as a simple card for completed) */}
            {session.expert && (
              <Card className={session.status === 'completed' ? 'border-primary-100 bg-primary-50/30' : ''}>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Expert Tutor</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-primary-600 font-bold text-xl">
                    {session.expert.profilePicture ? (
                      <img 
                        src={session.expert.profilePicture} 
                        alt={session.expert.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      session.expert.fullName?.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 leading-tight">
                      {session.expert.fullName}
                    </h4>
                    <p className="text-xs text-gray-600">Expert Student</p>
                    {session.expert.averageRating && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-700">
                          {session.expert.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-400">
                          ({session.expert.totalReviews || 0} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expert Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-primary-50 shadow-sm">
                    < Award className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sessions</p>
                    <p className="text-lg font-bold text-gray-900">
                      {session.expert.sessionsConducted || 0}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-primary-50 shadow-sm">
                    <TrendingUp className="w-4 h-4 text-primary-600 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">GPA</p>
                    <p className="text-lg font-bold text-gray-900">
                      {session.expert.gpa?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                </div>

                {session.status !== 'completed' && (
                  <>
                    {session.expert.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {session.expert.bio}
                        </p>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth
                      onClick={() => navigate(`/expert/${session.expert._id}`)}
                    >
                      View Full Profile
                    </Button>
                  </>
                )}
              </Card>
            )}

            {/* Session Reviews */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary-600" />
                Reviews for this expert in this session
              </h3>
              {loadingReviews ? (
                <div className="py-4 flex justify-center">
                  <Loader size="sm" text="Loading reviews..." />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No reviews for this session yet. Be the first to rate after you attend.
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {reviews.map((r) => (
                    <div key={r._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {r.reviewer?.fullName || 'Student'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span>{r.rating}</span>
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-gray-600 whitespace-pre-line">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Module Info */}
            {session.module && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  Module Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Code</p>
                    <p className="font-medium text-gray-900">{session.module.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{session.module.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Credits</p>
                    <p className="font-medium text-gray-900">{session.module.credits} Credits</p>
                  </div>
                  {session.module.specializations && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">For</p>
                      <div className="flex flex-wrap gap-1">
                        {session.module.specializations.map((spec) => (
                          <Badge key={spec} size="sm" variant="default">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Help Card */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Have questions about this session?
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/chat')}>
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw from Session"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleWithdraw} loading={actionLoading}>
              Confirm Withdrawal
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to withdraw from this session? This action cannot be undone.
        </p>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRating(0);
          setRatingComment('');
        }}
        title="Rate This Session"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRateExpert} loading={ratingSubmitLoading}>
              Submit Rating
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Expert Feedback</h3>
            <p className="text-sm text-gray-600">
              How was your learning experience with {session.expert?.fullName || 'the expert'}?
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
              Your overall rating
            </label>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Share your feedback (Optional)
            </label>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="What did you learn? How can the expert improve?"
              rows={4}
            />
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
};

export default SessionDetail;
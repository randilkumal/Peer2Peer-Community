

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import API from '../../utils/api';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  History,
  Send,
  Trash2
} from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentSessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('announcements');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showRequestSessionModal, setShowRequestSessionModal] = useState(false);
  const [requestSessionForm, setRequestSessionForm] = useState({ topic: '', moduleCode: '', reason: '' });
  const [requestSessionLoading, setRequestSessionLoading] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState(null);
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);

  const [sessions, setSessions] = useState({
    announcements: [],
    requested: [],
    pending: [],
    completed: [],
    cancelled: [],
    aiRecommendations: []
  });

  const [modules, setModules] = useState([]);
  const [enrolledModules, setEnrolledModules] = useState([]);
  const [yearModules, setYearModules] = useState([]);
  const [videoSuggestions, setVideoSuggestions] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [mySessionRequests, setMySessionRequests] = useState([]);

  useEffect(() => {
    if (user) {
      loadEnrolledModules();
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  useEffect(() => {
    fetchModules();
  }, []); // Only once on mount

  // When switching to Request History tab, load student's session requests
  useEffect(() => {
    if (activeTab === 'requested') {
      loadMySessionRequests();
    }
  }, [activeTab]);

  // Load YouTube video suggestions when on AI tab and user types a query
  useEffect(() => {
    const load = async () => {
      if (activeTab !== 'ai-recommendations') {
        setVideoSuggestions([]);
        setLoadingVideos(false);
        return;
      }
      if (!searchQuery || searchQuery.trim().length < 3) {
        setVideoSuggestions([]);
        setLoadingVideos(false);
        return;
      }
      try {
        setLoadingVideos(true);
        const trimmed = searchQuery.trim();
        const res = await API.get(`/ai/suggest-session-videos?query=${encodeURIComponent(trimmed)}`);
        const serverSuggestions = Array.isArray(res.data?.suggestions) ? res.data.suggestions : [];

        // Fallback: build simple YouTube search links on the client so the tab is never empty.
        const fallbackBase = 'https://www.youtube.com/results?search_query=';
        const enc = (q) => encodeURIComponent(q);
        const fallbackSuggestions = [
          {
            title: `YouTube search for "${trimmed}"`,
            description: `Open YouTube results for "${trimmed}".`,
            type: 'Search',
            videoUrl: `${fallbackBase}${enc(trimmed)}`,
            platform: 'YouTube'
          },
          {
            title: `Tutorial videos: ${trimmed}`,
            description: 'Find hands‑on tutorials and walkthroughs.',
            type: 'Tutorial',
            videoUrl: `${fallbackBase}${enc(trimmed + ' tutorial')}`,
            platform: 'YouTube'
          }
        ];

        setVideoSuggestions(serverSuggestions.length > 0 ? serverSuggestions : fallbackSuggestions);
      } catch (e) {
        console.error('❌ Session video suggestions failed:', e);
        const trimmed = searchQuery.trim();
        const base = 'https://www.youtube.com/results?search_query=';
        const enc = (q) => encodeURIComponent(q);
        setVideoSuggestions([
          {
            title: `YouTube search for "${trimmed}"`,
            description: `Open YouTube results for "${trimmed}".`,
            type: 'Search',
            videoUrl: `${base}${enc(trimmed)}`,
            platform: 'YouTube'
          },
          {
            title: `Tutorial videos: ${trimmed}`,
            description: 'Find hands‑on tutorials and walkthroughs.',
            type: 'Tutorial',
            videoUrl: `${base}${enc(trimmed + ' tutorial')}`,
            platform: 'YouTube'
          }
        ]);
      } finally {
        setLoadingVideos(false);
      }
    };

    load();
  }, [activeTab, searchQuery]);
  const loadEnrolledModules = async () => {
    try {
      // Preferred: use student's enrolledModules codes
      const enrolledCodes = user?.enrolledModules || [];
      if (enrolledCodes.length > 0) {
        const studentModules = allModules.filter((m) => enrolledCodes.includes(m.code));
        setEnrolledModules(studentModules);
        return;
      }

      // Fallback: use year-based modules if no enrolledModules configured
      const year = user?.yearLevel || 1;
      try {
        const yearRes = await API.get(`/modules/by-year/${year}`);
        const list = yearRes.data.modules || [];
        setYearModules(list);
      } catch (e) {
        console.error('Error loading year-based modules:', e);
        setYearModules(modules);
      }
    } catch (error) {
      console.error('Error loading enrolled modules:', error);
      setEnrolledModules([]);
      setYearModules([]);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await API.get('/modules');
      setModules(response.data.modules || []);
    } catch (error) {
    }
  };

  const fetchSessions = async () => {
    try {
      // Only show full-page loader if current tab data is completely empty
      const currentTabData = sessions[activeTab] || [];
      if (currentTabData.length === 0) {
        setLoading(true);
      }

      if (activeTab === 'announcements') {
        const response = await API.get('/sessions?status=requested');
        setSessions(prev => ({ ...prev, announcements: response.data.sessions || [] }));
      }
      else if (activeTab === 'pending') {
        const response = await API.get(`/sessions?status=pending&participant=${user._id}`);
        setSessions(prev => ({ ...prev, pending: response.data.sessions || [] }));
      }
      else if (activeTab === 'completed') {
        const response = await API.get(`/sessions?status=completed&participant=${user._id}`);
        setSessions(prev => ({ ...prev, completed: response.data.sessions || [] }));
      }
      else if (activeTab === 'cancelled') {
        const response = await API.get('/sessions?status=cancelled');
        setSessions(prev => ({ ...prev, cancelled: response.data.sessions || [] }));
      }
    } catch (error) {
      setSessions(prev => ({ ...prev, [activeTab]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (session) => {
    joinInstant(session);
  };

  const isJoined = (session) => {
    const me = user?._id;
    return (session.participants || []).some((p) => (p?._id || p)?.toString() === me?.toString());
  };

  const joinInstant = async (session) => {
    if (!session?._id) return;
    try {
      setJoiningSessionId(session._id);
      await API.post(`/sessions/${session._id}/join`, { role: 'student' });
      toast.success('Joined session successfully');
      fetchSessions();
    } catch (e) {
      // toast.error is already handled by the API interceptor
    } finally {
      setJoiningSessionId(null);
    }
  };

  const openRequestSessionModal = () => {
    setShowRequestSessionModal(true);
    // Load student's previous session requests for status visibility
    loadMySessionRequests();
  };

  const submitRequestSession = async (e) => {
    if (e) e.preventDefault();

    if (!requestSessionForm.topic?.trim() || !requestSessionForm.reason?.trim()) {
      toast.error('Topic and reason are required');
      return;
    }
    try {
      setRequestSessionLoading(true);

      await API.post('/session-requests', {
        topic: requestSessionForm.topic.trim(),
        moduleCode: requestSessionForm.moduleCode || '',
        reason: requestSessionForm.reason.trim()
      });

      toast.success('Your session request has been sent to the admin (Delivered)');
      setShowRequestSessionModal(false);
      setRequestSessionForm({ topic: '', moduleCode: '', reason: '' });
      // Refresh local history so student can see latest "Delivered" entry
      loadMySessionRequests();
    } catch (e) {
      // toast.error is already handled by the API interceptor
    } finally {
      setRequestSessionLoading(false);
    }
  };

  const loadMySessionRequests = async () => {
    try {
      const res = await API.get('/session-requests/my-requests');
      setMySessionRequests(Array.isArray(res.data.sessionRequests) ? res.data.sessionRequests : []);
    } catch (e) {
      // toast.error is already handled by the API interceptor
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this session request?')) return;
    try {
      await API.delete(`/session-requests/${requestId}`);
      toast.success('Session request deleted successfully');
      loadMySessionRequests();
    } catch (e) {
      // toast.error is already handled by the API interceptor
    }
  };

  const handleWithdraw = async (sessionId) => {
    if (!confirm('Are you sure you want to withdraw from this session?')) return;

    try {
      await API.post(`/sessions/${sessionId}/withdraw`);
      toast.success('Withdrawn from session successfully');
      fetchSessions();
    } catch (error) {
      // toast.error is already handled by the API interceptor
    }
  };

  const handleRateExpert = (session) => {
    setSelectedSession(session);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    const expertId = selectedSession?.expert?._id || selectedSession?.expert;
    const sessionId = selectedSession?._id || selectedSession?.id;
    if (!expertId || !sessionId) {
      toast.error('Missing session data. Refresh and try again.');
      return;
    }

    try {
      setRatingSubmitLoading(true);
      await API.post(`/reviews/expert`, {
        expertId: String(expertId),
        sessionId: String(sessionId),
        rating: Number(rating),
        comment: ratingComment
      });
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      setRating(0);
      setRatingComment('');
      setSelectedSession(null);
      fetchSessions();
    } catch (error) {
      // toast.error is already handled by the API interceptor
    } finally {
      setRatingSubmitLoading(false);
    }
  };

  const getFilteredSessions = () => {
    let sessionList = sessions[activeTab] || [];

    if (searchQuery) {
      sessionList = sessionList.filter(session =>
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterModule) {
      sessionList = sessionList.filter(session =>
        session.moduleCode === filterModule
      );
    }

    return sessionList;
  };

  const SessionCard = ({ session, showActions = true }) => {
    const isAnnouncement = activeTab === 'announcements';
    const isAI = activeTab === 'ai-recommendations';

    const getStatusBadge = () => {
      if (isAnnouncement) {
        const spotsLeft = session.maxParticipants - (session.participants?.length || 0);
        return (
          <Badge variant={spotsLeft > 5 ? 'success' : 'warning'}>
            {spotsLeft} spots left
          </Badge>
        );
      }
      if (activeTab === 'pending') return <Badge variant="warning">Pending</Badge>;
      if (activeTab === 'completed') return <Badge variant="default">Completed</Badge>;
      if (activeTab === 'cancelled') return <Badge variant="danger">Cancelled</Badge>;
      if (isAI) return <Badge variant="primary"><Sparkles className="w-3 h-3" /> AI Suggested</Badge>;
      return null;
    };

    return (
      <Card
        hover
        className="cursor-pointer"
        onClick={() => navigate(`/student/sessions/${session._id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {session.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="primary-outline" size="sm">
                {session.moduleCode}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
          {session.expert?.averageRating && (
            <div className="flex items-center gap-1 ml-4">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{session.expert.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {session.description}
        </p>

        <div className="space-y-2 mb-4">
          {session.date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.date)}</span>
            </div>
          )}

          {session.startTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{session.startTime} - {session.endTime || 'TBA'}</span>
            </div>
          )}

          {session.venue && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {session.isOnline ? (
                <>
                  <Video className="w-4 h-4" />
                  <span>Online Session</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>{session.venue}</span>
                </>
              )}
            </div>
          )}

          {isAnnouncement && (
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {session.participants?.length || 0} / {session.maxParticipants || 25} students joined
                </span>
                <div className="flex-1 ml-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{
                        width: `${((session.participants?.length || 0) / (session.maxParticipants || 25)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              {!!(session.pendingRequests?.length) && (
                <div className="text-xs text-gray-500 ml-6">
                  {session.pendingRequests.filter(r => r.status === 'pending').length} student
                  {session.pendingRequests.filter(r => r.status === 'pending').length === 1 ? '' : 's'} requested this session
                </div>
              )}
            </div>
          )}

          {session.expert?.status && (
            <div className="flex items-center gap-2 text-sm">
              {session.expert.confirmed ? (
                <Badge variant="success" size="sm">
                  <CheckCircle className="w-3 h-3" /> Expert Confirmed
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  <AlertCircle className="w-3 h-3" /> Waiting for Expert
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session.expert ? (
              <>
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {session.expert.fullName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.expert.fullName}
                  </p>
                  <p className="text-xs text-gray-500">Expert Tutor</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-600">Expert TBA</p>
                <p className="text-xs text-gray-500">Waiting for volunteer</p>
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {(isAnnouncement || activeTab === 'pending') &&
                session.status !== 'cancelled' &&
                session.status !== 'completed' && (
                  <Button
                    size="sm"
                    onClick={() => joinInstant(session)}
                    loading={joiningSessionId === session._id}
                    disabled={isJoined(session)}
                  >
                    {isJoined(session) ? 'Joined' : 'Join'}
                  </Button>
                )}

              {activeTab === 'completed' && session.expert && !session.userRated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRateExpert(session)}
                >
                  Rate Expert
                </Button>
              )}

              {isAI && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleJoinSession(session)}
                >
                  Join
                </Button>
              )}
            </div>
          )}
        </div>

        {isAI && session.recommendationReason && (
          <div className="mt-3 pt-3 border-t border-gray-200 bg-purple-50 -mx-6 -mb-6 px-6 py-3 rounded-b-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
              <p className="text-sm text-purple-900">
                <strong>Why recommended:</strong> {session.recommendationReason}
              </p>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const tabs = [
    { id: 'announcements', label: 'Session Announcements', icon: FileText, count: sessions.announcements.length },
    { id: 'pending', label: 'Pending', icon: Clock, count: sessions.pending.length },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: sessions.completed.length },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle, count: sessions.cancelled.length },
    { id: 'requested', label: 'Request History', icon: History, count: mySessionRequests.length },
    { id: 'ai-recommendations', label: 'AI Suggestions', icon: Sparkles, count: videoSuggestions.length },
  ];

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h1>
            <p className="text-gray-600">
              Browse available sessions, track your requests, and view your session history
            </p>
          </div>
          <Button icon={Send} onClick={openRequestSessionModal}>
            Request Session
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions by title, module, or description..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <Select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              options={[
                { value: '', label: 'All Modules' },
                ...modules.map(m => ({ value: m.code, label: `${m.code} - ${m.name}` }))
              ]}
              placeholder="Filter by module"
            />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'ai-recommendations' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="mb-6 overflow-hidden border-purple-100 shadow-sm">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-6">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-3">
                    <Sparkles className="w-full h-full text-purple-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      AI Session Video Suggestions
                    </h3>
                    <p className="text-gray-600 max-w-2xl">
                      {searchQuery
                        ? `Leveraging AI to find the best YouTube resources for "${searchQuery}".`
                        : 'Discover external learning resources tailored to your upcoming sessions and modules.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!searchQuery ? (
                  <div className="py-12 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to explore?</h4>
                    <p className="text-gray-500 mb-6">
                      Type a module code, topic, or concept in the search bar above to get personalized video suggestions.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                       {['React basics', 'Data Structures', 'Python for AI'].map(tag => (
                         <button 
                           key={tag}
                           onClick={() => setSearchQuery(tag)}
                           className="px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-gray-600 rounded-full text-xs font-medium transition-colors border border-transparent hover:border-primary-100"
                         >
                           {tag}
                         </button>
                       ))}
                    </div>
                  </div>
                ) : loadingVideos ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
                    </div>
                    <p className="mt-4 text-purple-900 font-medium animate-pulse">Scanning learning resources...</p>
                    <p className="text-gray-500 text-sm">Finding the most relevant YouTube videos for you</p>
                  </div>
                ) : videoSuggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoSuggestions.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => window.open(v.videoUrl, '_blank')}
                        className="group flex flex-col h-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            v.type === 'Playlist' ? 'bg-indigo-50 text-indigo-600' :
                            v.type === 'Concept' ? 'bg-emerald-50 text-emerald-600' :
                            v.type === 'Tutorial' ? 'bg-amber-50 text-amber-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {v.type || 'Video'}
                          </div>
                          {typeof v.relevance === 'number' && (
                            <div className="flex items-center gap-1.5" title={`${v.relevance}% AI Relevance Match`}>
                               <span className="text-[10px] font-semibold text-gray-400">Match score:</span>
                               <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-500 rounded-full" style={{ width: `${v.relevance}%` }}></div>
                               </div>
                            </div>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-purple-700 transition-colors">
                          {v.title}
                        </h4>
                        
                        {v.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                            {v.description}
                          </p>
                        )}
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                            <div className="w-5 h-5 bg-red-50 rounded-full flex items-center justify-center p-1">
                               <Video className="w-full h-full text-red-600" />
                            </div>
                            <span>{v.platform || 'YouTube'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                            Watch Now <span className="text-lg">→</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border-t border-gray-100 mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      No YouTube suggestions found for <span className="font-semibold text-gray-900">"{searchQuery}"</span>.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Try changing the topic, using different keywords, or searching for a module code like "CS101".
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : activeTab === 'requested' ? (
          // Special rendering for Request History: show SessionRequest messages, not Session objects
          mySessionRequests.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No session requests yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Use the "Request Session" button to send a request to admin.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {mySessionRequests.map((req) => (
                <Card key={req._id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{req.topic}</p>
                      {req.moduleCode && (
                        <p className="text-sm text-primary-600 mb-1">Module: {req.moduleCode}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-1 line-clamp-2">{req.reason}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={req.messageStatus === 'seen' ? 'success' : 'default'}
                        size="sm"
                      >
                        {req.messageStatus === 'seen' ? 'Message seen' : 'Delivered'}
                      </Badge>
                      <button
                        onClick={() => handleDeleteRequest(req._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="Loading sessions..." />
          </div>
        ) : getFilteredSessions().length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'announcements' && <FileText className="w-8 h-8 text-gray-400" />}
                {activeTab === 'confirmed' && <CheckCircle className="w-8 h-8 text-gray-400" />}
                {activeTab === 'history' && <History className="w-8 h-8 text-gray-400" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'announcements' && 'No session announcements available'}
                {activeTab === 'confirmed' && 'No confirmed sessions'}
                {activeTab === 'history' && 'No completed sessions yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'announcements' && 'Check back later for new session announcements'}
                {activeTab === 'confirmed' && 'Your confirmed sessions will appear here'}
                {activeTab === 'history' && 'Completed sessions will be shown here'}
              </p>
              {activeTab === 'announcements' && (
                <Button variant="outline" onClick={() => fetchSessions()}>Refresh</Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredSessions().map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </div>
        )}
      </div>

      {/* Request New Session Modal - FIXED */}
      <Modal
        isOpen={showRequestSessionModal}
        onClose={() => {
          setShowRequestSessionModal(false);
          setRequestSessionForm({ topic: '', moduleCode: '', reason: '' });
        }}
        title="Request a New Session"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestSessionModal(false);
                setRequestSessionForm({ topic: '', moduleCode: '', reason: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="session-request-form"
              loading={requestSessionLoading}
              icon={Send}
            >
              Send to Admin
            </Button>
          </>
        }
      >
        <div>
          <p className="text-gray-600 mb-4">
            Submit a request for a new session. The admin will review your request and may create a session announcement.
          </p>

          {/* Show warning if no enrolled modules; year-based modules will still be used as fallback */}
          {enrolledModules.length === 0 && yearModules.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You don't have any enrolled modules in your profile yet. Please update your profile to add your current modules.
              </p>
            </div>
          )}

          <form id="session-request-form" onSubmit={submitRequestSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic / Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requestSessionForm.topic}
                onChange={(e) => setRequestSessionForm({ ...requestSessionForm, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="e.g., Data Structures, MongoDB, React"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module <span className="text-gray-500">(optional)</span>
              </label>
              <select
                value={requestSessionForm.moduleCode}
                onChange={(e) => setRequestSessionForm({ ...requestSessionForm, moduleCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="">Select module (optional)</option>
                {modules.length > 0 ? (
                  modules.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.code} - {m.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No modules found</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {modules.length > 0
                  ? `Showing all ${modules.length} available modules`
                  : 'Loading modules...'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requestSessionForm.reason}
                onChange={(e) => setRequestSessionForm({ ...requestSessionForm, reason: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="Explain why you need this session..."
                required
              />
            </div>

            {/* My previous requests with delivery status */}
            {mySessionRequests.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Your recent requests</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                  {mySessionRequests.slice(0, 5).map((req) => (
                    <div key={req._id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{req.topic}</p>
                        {req.moduleCode && (
                          <p className="text-xs text-gray-500">Module: {req.moduleCode}</p>
                        )}
                      </div>
                      <Badge
                        variant={req.messageStatus === 'seen' ? 'success' : 'default'}
                        size="sm"
                      >
                        {req.messageStatus === 'seen' ? 'Message seen' : 'Delivered'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </Modal>

      {/* Rate Expert Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRating(0);
          setRatingComment('');
        }}
        title="Rate Expert"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitRating} loading={ratingSubmitLoading}>
              Submit Rating
            </Button>
          </>
        }
      >
        {selectedSession && (
          <div>
            <p className="text-gray-600 mb-4">
              How was your session with {selectedSession.expert?.fullName}?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Share your experience..."
              />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default StudentSessions;
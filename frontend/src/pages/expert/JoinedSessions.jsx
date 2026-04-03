import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import API from "../../utils/api";
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
  Search,
  Sparkles,
  History,
  UserCheck,
  Send,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const ExpertJoinedSessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "announcements";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [completedSubTab, setCompletedSubTab] = useState("joined");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [joinRole, setJoinRole] = useState("student");
  const [joinReason, setJoinReason] = useState("");
  const [showRequestSessionModal, setShowRequestSessionModal] = useState(false);
  const [requestSessionForm, setRequestSessionForm] = useState({
    topic: "",
    moduleCode: "",
    reason: "",
  });
  const [requestSessionLoading, setRequestSessionLoading] = useState(false);
  const [yearModules, setYearModules] = useState([]);
  const [sessions, setSessions] = useState({
    announcements: [],
    pending: [],
    completedJoined: [],
    completedConducted: [],
    cancelled: [],
    myRequests: [],
    aiRecommendations: [],
  });
  const [modules, setModules] = useState([]);

  useEffect(() => {
    const t = searchParams.get("tab") || "announcements";
    setActiveTab(t);
    if (t === "completed")
      setCompletedSubTab(searchParams.get("sub") || "joined");
  }, [searchParams]);

  useEffect(() => {
    fetchSessions();
    fetchModules();
  }, [activeTab, completedSubTab, user?._id]);

  const fetchModules = async () => {
    try {
      const res = await API.get("/modules");
      setModules(res.data.modules || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessions = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      if (activeTab === "announcements") {
        const res = await API.get("/sessions?status=requested");
        setSessions((prev) => ({
          ...prev,
          announcements: res.data.sessions || [],
        }));
      } else if (activeTab === "pending") {
        const res = await API.get("/sessions?status=pending");
        setSessions((prev) => ({ ...prev, pending: res.data.sessions || [] }));
      } else if (activeTab === "completed") {
        const res = await API.get(
          "/sessions?status=completed&participant=" + user._id,
        );
        const conducted = (res.data.sessions || []).filter(
          (s) => s.expert?._id === user._id || s.expert === user._id,
        );
        const joined = (res.data.sessions || []).filter(
          (s) => s.expert?._id !== user._id && s.expert !== user._id,
        );
        setSessions((prev) => ({
          ...prev,
          completedJoined: joined,
          completedConducted: conducted,
        }));
      } else if (activeTab === "cancelled") {
        const res = await API.get("/sessions?status=cancelled");
        setSessions((prev) => ({
          ...prev,
          cancelled: res.data.sessions || [],
        }));
      } else if (activeTab === "my-requests") {
        const res = await API.get("/sessions/my-requests");
        setSessions((prev) => ({
          ...prev,
          myRequests: res.data.sessions || [],
        }));
      } else if (activeTab === "ai-recommendations") {
        let recs = [];
        try {
          const res = await API.get("/ai/recommend-sessions");
          recs = res.data.sessions || [];
        } catch (e) {
          console.error("AI recommendations failed:", e);
        }
        if (recs.length === 0) {
          try {
            const annRes = await API.get("/sessions?status=requested");
            recs = annRes.data.sessions || [];
          } catch (e2) {
            console.error("Announcements fallback failed:", e2);
          }
        }
        setSessions((prev) => ({ ...prev, aiRecommendations: recs }));
      }
    } catch (error) {
      console.error(error);
      setSessions((prev) => ({ ...prev, [activeTab]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = (session, role) => {
    setSelectedSession(session);
    setJoinRole(role);
    setJoinReason("");
    setShowJoinModal(true);
  };

  const openRequestSessionModal = async () => {
    setShowRequestSessionModal(true);
    try {
      const year = user?.yearLevel || 1;
      const res = await API.get(`/modules/by-year/${year}`);
      const list = res.data.modules || [];
      setYearModules(list.length > 0 ? list : modules);
    } catch {
      setYearModules(modules);
    }
  };

  const submitRequestSession = async () => {
    if (
      !requestSessionForm.topic?.trim() ||
      !requestSessionForm.reason?.trim()
    ) {
      toast.error("Topic and reason are required");
      return;
    }
    try {
      setRequestSessionLoading(true);
      await API.post("/session-requests", {
        topic: requestSessionForm.topic.trim(),
        moduleCode: requestSessionForm.moduleCode || "",
        reason: requestSessionForm.reason.trim(),
      });
      toast.success("Your session request has been sent to the admin");
      setShowRequestSessionModal(false);
      setRequestSessionForm({ topic: "", moduleCode: "", reason: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit request");
    } finally {
      setRequestSessionLoading(false);
    }
  };

  const confirmJoin = async () => {
    try {
      await API.post(`/sessions/${selectedSession._id}/join`, {
        role: joinRole,
        reason: joinReason,
      });
      toast.success(`Request to join as ${joinRole} sent successfully`);
      setShowJoinModal(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send request");
    }
  };

  const getList = () => {
    if (activeTab === "completed") {
      return completedSubTab === "conducted"
        ? sessions.completedConducted
        : sessions.completedJoined;
    }
    return sessions[activeTab] || [];
  };

  const getFilteredSessions = () => {
    let list = getList();
    if (searchQuery) {
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.moduleCode?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (filterModule) list = list.filter((s) => s.moduleCode === filterModule);
    return list;
  };

  const getUserSessionStatus = (session) => {
    const safeId = String(user?._id);

    const sExpertId = session.expert?._id || session.expert;
    if (sExpertId && String(sExpertId) === safeId) return "conducting";

    const isParticipant = session.participants?.some(
      (p) => String(p?._id || p) === safeId,
    );
    if (isParticipant) return "joined";

    const myRequest = session.pendingRequests?.find(
      (r) => String(r.user?._id || r.user) === safeId && r.status === "pending",
    );
    if (myRequest)
      return myRequest.role === "expert"
        ? "requested_expert"
        : "requested_student";

    return null;
  };

  const isUserRequested = (session) => !!getUserSessionStatus(session);

  const SessionCard = ({ session, showJoinButtons = false }) => (
    <Card
      hover
      className="cursor-pointer"
      onClick={() => navigate(`/expert/sessions/${session._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {session.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="primary-outline" size="sm">
              {session.moduleCode}
            </Badge>
            <Badge
              variant={
                session.status === "requested"
                  ? "info"
                  : session.status === "cancelled"
                    ? "danger"
                    : session.status === "completed"
                      ? "default"
                      : "success"
              }
            >
              {session.status === "requested" ? "Announcement" : session.status}
            </Badge>
          </div>
        </div>
        {session.expert?.averageRating && (
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">
              {session.expert.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
        {session.description}
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1" title="Required Students">
          <Users className="h-4 w-4" />
          {session.participants?.length || 0} /{" "}
          {session.requiredStudents || session.maxParticipants || 25} students
        </span>
        <span className="flex items-center gap-1" title="Required Experts">
          <UserCheck className="h-4 w-4" />
          {session.expert ? 1 : (session.pendingRequests?.filter(r => r.role === 'expert' && r.status === 'pending').length || 0)} / {session.requiredExperts || 1} expert{session.requiredExperts > 1 ? 's' : ''}
        </span>
      </div>

      {session.date && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4" />
          {formatDate(session.date)}
          {session.startTime && ` • ${session.startTime}`}
        </div>
      )}

      {showJoinButtons &&
        (session.status === "requested" || session.status === "pending") && (
          <div
            className="pt-4 border-t border-gray-200 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {!isUserRequested(session) && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleJoinClick(session, "student")}
                >
                  Join as Student
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoinClick(session, "expert")}
                >
                  Join as Conductor
                </Button>
              </>
            )}
            {getUserSessionStatus(session) === "conducting" && (
              <Badge variant="success">You're Conducting</Badge>
            )}
            {getUserSessionStatus(session) === "joined" && (
              <Badge variant="success">Joined</Badge>
            )}
            {getUserSessionStatus(session) === "requested_expert" && (
              <Badge variant="warning">Requested to Conduct</Badge>
            )}
            {getUserSessionStatus(session) === "requested_student" && (
              <Badge variant="warning">Requested to Join</Badge>
            )}
          </div>
        )}
      {activeTab === 'ai-recommendations' && session.recommendationReason && (
        <div className="mt-3 pt-3 border-t border-gray-200 bg-purple-50 -mx-6 -mb-6 px-6 py-3 rounded-b-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
            <p className="text-sm text-purple-900">
              <strong>Recommendation:</strong> {session.recommendationReason}
            </p>
          </div>
        </div>
      )}
    </Card>
  );

  const tabs = [
    {
      id: "announcements",
      label: "Session Announcements",
      icon: FileText,
      count: sessions.announcements.length,
    },
    {
      id: "pending",
      label: "Pending",
      icon: Clock,
      count: sessions.pending.length,
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle,
      count: (sessions.completedJoined?.length || 0) + (sessions.completedConducted?.length || 0),
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      count: sessions.cancelled.length,
    },
    {
      id: "my-requests",
      label: "Request History",
      icon: History,
      count: sessions.myRequests.length,
    },
    {
      id: "ai-recommendations",
      label: "AI Suggestions",
      icon: Sparkles,
      count: sessions.aiRecommendations.length,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-600 mt-1">
              Browse announcements, join as student or conductor, and view your
              session history
            </p>
          </div>
          <Button icon={Send} onClick={openRequestSessionModal}>
            Request Session
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
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-2 overflow-x-auto flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap font-medium ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        activeTab === tab.id
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === "completed" && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setCompletedSubTab("joined")}
                className={`px-3 py-1.5 rounded text-sm font-medium ${completedSubTab === "joined" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"}`}
              >
                Joined Sessions
              </button>
              <button
                onClick={() => setCompletedSubTab("conducted")}
                className={`px-3 py-1.5 rounded text-sm font-medium ${completedSubTab === "conducted" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"}`}
              >
                Conducted Sessions
              </button>
            </div>
          )}
        </div>

        {activeTab === "ai-recommendations" && (
          <Card className="mb-8 border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2.5">
                <Sparkles className="w-full h-full text-purple-600 animate-pulse" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-gray-900">Expert AI Recommendations</h3>
                <p className="text-sm text-gray-600">
                  Tailored session opportunities based on your expertise and enrolled modules.
                </p>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="Loading..." />
          </div>
        ) : getFilteredSessions().length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sessions found
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === "announcements" &&
                  "No session announcements available"}
                {activeTab === "pending" && "No scheduled pending sessions"}
                {activeTab === "cancelled" && "No cancelled sessions"}
                {activeTab === "my-requests" &&
                  "You have not requested any sessions yet"}
                {activeTab === "ai-recommendations" &&
                  "No AI recommendations available"}
                {activeTab === "completed" && "No completed sessions"}
              </p>
              {activeTab === "announcements" && (
                <Button icon={Send} onClick={openRequestSessionModal}>
                  Request Session
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredSessions().map((s) => (
              <SessionCard
                key={s._id}
                session={s}
                showJoinButtons={
                  activeTab === "announcements" ||
                  activeTab === "pending" ||
                  activeTab === "ai-recommendations"
                }
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedSession(null);
        }}
        title={
          joinRole === "expert"
            ? "Volunteer as Conductor"
            : "Request to Join as Student"
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setShowJoinModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmJoin}>Send Request</Button>
          </>
        }
      >
        {selectedSession && (
          <div>
            <p className="text-gray-600 mb-4">
              {joinRole === "expert"
                ? "You are volunteering to conduct this session. Add a brief reason for the admin."
                : "Request to join as a student. Add a brief reason for the admin."}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900">
                {selectedSession.title}
              </p>
              <p className="text-sm text-gray-600">
                {selectedSession.moduleCode}
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={joinReason}
              onChange={(e) => setJoinReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              placeholder="Why do you want to join / conduct this session?"
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showRequestSessionModal}
        onClose={() => {
          setShowRequestSessionModal(false);
          setRequestSessionForm({ topic: "", moduleCode: "", reason: "" });
        }}
        title="Request a New Session"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowRequestSessionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRequestSession}
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
            Submit a request for a new session. The admin will review your
            request.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic / Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requestSessionForm.topic}
                onChange={(e) =>
                  setRequestSessionForm({
                    ...requestSessionForm,
                    topic: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="e.g., Data Structures, MongoDB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module (optional)
              </label>
              <select
                value={requestSessionForm.moduleCode}
                onChange={(e) =>
                  setRequestSessionForm({
                    ...requestSessionForm,
                    moduleCode: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              >
                <option value="">Select module (optional)</option>
                {yearModules.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requestSessionForm.reason}
                onChange={(e) =>
                  setRequestSessionForm({
                    ...requestSessionForm,
                    reason: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                placeholder="Explain why you need this session..."
              />
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ExpertJoinedSessions;

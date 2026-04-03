import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import API from "../../utils/api";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  UserCheck,
  MessageSquare,
  RefreshCw,
  FilterX,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminSessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("announcements");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [modules, setModules] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(false);

  const [sessions, setSessions] = useState({
    announcements: [],
    pending: [],
    completed: [],
    cancelled: [],
    sessionRequestHistory: [],
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  const fetchModules = async () => {
    try {
      setModuleLoading(true);
      const res = await API.get("/modules");
      setModules(res.data.modules || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load modules");
    } finally {
      setModuleLoading(false);
    }
  };

  const fetchSessions = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      if (activeTab === "announcements") {
        const res = await API.get("/sessions?status=requested");
        setSessions((prev) => ({
          ...prev,
          announcements: res.data.sessions || [],
        }));
      } else if (activeTab === "pending") {
        const res = await API.get("/sessions?status=pending");
        setSessions((prev) => ({
          ...prev,
          pending: res.data.sessions || [],
        }));
      } else if (activeTab === "completed") {
        const res = await API.get("/sessions?status=completed");
        setSessions((prev) => ({
          ...prev,
          completed: res.data.sessions || [],
        }));
      } else if (activeTab === "cancelled") {
        const res = await API.get("/sessions?status=cancelled");
        setSessions((prev) => ({
          ...prev,
          cancelled: res.data.sessions || [],
        }));
      } else if (activeTab === "session-request-history") {
        const res = await API.get("/session-requests");
        setSessions((prev) => ({
          ...prev,
          sessionRequestHistory: res.data.sessionRequests || [],
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sessions");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchSessions(true), fetchModules()]);
    toast.success("Session data refreshed");
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      setActionLoading(`delete-${requestToDelete._id}`);
      await API.delete(`/session-requests/${requestToDelete._id}`);
      toast.success("Session request deleted successfully");
      await fetchSessions(true);
    } catch (error) {
      toast.error("Failed to delete session request");
    } finally {
      setDeleteModalOpen(false);
      setRequestToDelete(null);
      setActionLoading(null);
    }
  };

  const handleCancelSession = async () => {
    if (!sessionToCancel) return;
    try {
      setActionLoading(`cancel-${sessionToCancel._id}`);
      await API.patch(`/sessions/${sessionToCancel._id}/cancel`);
      toast.success("Announcement cancelled");
      await fetchSessions(true);
    } catch (e) {
      toast.error("Failed to cancel");
    } finally {
      setCancelModalOpen(false);
      setSessionToCancel(null);
      setActionLoading(null);
    }
  };

  const handleMarkAsSeen = async (requestId) => {
    try {
      setActionLoading(`seen-${requestId}`);
      await API.patch(`/session-requests/${requestId}/message-status`);
      toast.success("Marked as seen");
      await fetchSessions(true);
    } catch (error) {
      toast.error("Failed to update message status");
    } finally {
      setActionLoading(null);
    }
  };



  const clearFilters = () => {
    setSearchQuery("");
    setFilterModule("");
  };

  const filteredSessions = useMemo(() => {
    let list = sessions[activeTab] || [];

    if (activeTab === "session-request-history") {
      return [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(query) ||
          s.moduleCode?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query),
      );
    }

    if (filterModule) {
      list = list.filter((s) => s.moduleCode === filterModule);
    }

    return list;
  }, [sessions, activeTab, searchQuery, filterModule]);

  const sessionRequests = sessions.sessionRequestHistory || [];

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
      count: sessions.completed.length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      count: sessions.cancelled.length,
    },
    {
      id: "session-request-history",
      label: "Request Session History",
      icon: MessageSquare,
      count: sessions.sessionRequestHistory.length,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
            <p className="mt-1 text-gray-600">
              Manage session announcements and requests
            </p>
          </div>

          <div className="flex gap-3">
            {/* <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button> */}
            <Button
              icon={Plus}
              onClick={() => navigate("/admin/sessions/create")}
            >
              Create Session Announcement
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500"
              disabled={moduleLoading}
            >
              <option value="">
                {moduleLoading ? "Loading modules..." : "All Modules"}
              </option>
              {modules.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.code}
                </option>
              ))}
            </select>

            <button 
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {activeTab !== "session-request-history" && (
            <p className="mt-4 text-sm text-gray-500">
              Showing {filteredSessions.length} of{" "}
              {(sessions[activeTab] || []).length} sessions
            </p>
          )}
        </Card>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-all ${activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id
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
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="Loading..." />
          </div>
        ) : activeTab === "session-request-history" ? (
          sessionRequests.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No session requests yet
                </h3>
                <p className="mb-4 text-gray-600">
                  Students and experts can request new sessions from the Request
                  Session form. Their messages will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessionRequests.map((req) => (
                <Card key={req._id} className="border-l-4 border-l-primary-500">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {req.user?.fullName || "Unknown"}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({req.user?.email || "No email"})
                        </span>
                        <Badge
                          variant={
                            req.messageStatus === "seen" ? "success" : "default"
                          }
                          size="sm"
                        >
                          {req.messageStatus === "seen"
                            ? "Message seen"
                            : "Delivered"}
                        </Badge>
                      </div>

                      <p className="mb-1 font-medium text-gray-900">
                        {req.topic}
                      </p>

                      {req.moduleCode && (
                        <p className="mb-1 text-sm text-primary-600">
                          Module: {req.moduleCode}
                        </p>
                      )}

                      <p className="text-sm text-gray-600">{req.reason}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(req.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {req.messageStatus !== "seen" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsSeen(req._id)}
                          loading={actionLoading === `seen-${req._id}`}
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
                        loading={actionLoading === `delete-${req._id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : filteredSessions.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {activeTab === "announcements" && "No session announcements"}
                {activeTab === "pending" && "No pending sessions"}
                {activeTab === "completed" && "No completed sessions"}
                {activeTab === "cancelled" && "No cancelled sessions"}
              </h3>
              <p className="mb-4 text-gray-600">
                {activeTab === "announcements" &&
                  "Create a session announcement to get started"}
                {activeTab === "pending" &&
                  "Sessions that have been scheduled will appear here"}
                {activeTab === "completed" &&
                  "Completed sessions will appear here"}
                {activeTab === "cancelled" &&
                  "Cancelled sessions will appear here"}
              </p>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filters
                </Button>

                {activeTab === "announcements" && (
                  <Button
                    icon={Plus}
                    onClick={() => navigate("/admin/sessions/create")}
                  >
                    Create Session Announcement
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredSessions.map((session) => (
              <Card
                key={session._id}
                hover
                className="cursor-pointer"
                onClick={() => navigate(`/admin/sessions/${session._id}`)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.title}
                    </h3>
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
                      className="ml-2"
                    >
                      {session.status === "requested"
                        ? "Announcement"
                        : session.status}
                    </Badge>
                  </div>
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {session.description}
                </p>

                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1 font-medium" title="Required Students">
                    <Users className="h-4 w-4" />
                    {session.participants?.length || 0} /{" "}
                    {session.requiredStudents}
                  </span>
                  <span className="flex items-center gap-1" title="Required Experts">
                    <UserCheck className="w-4 h-4" />
                    {session.expert ? 1 : (session.pendingRequests?.filter(r => r.role === 'expert' && r.status === 'pending').length || 0)} / {session.requiredExperts || 1}
                  </span>
                  {session.expert && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="h-3 w-3" /> Expert assigned
                    </Badge>
                  )}

                  {!session.expert &&
                    session.pendingRequests?.some(
                      (r) => r.role === "expert" && r.status === "pending",
                    ) && (
                      <Badge variant="warning" size="sm">
                        <UserCheck className="h-3 w-3" /> Expert Requested
                      </Badge>
                    )}
                </div>

                {session.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(session.date)}
                    {session.startTime && ` • ${session.startTime}`}
                  </div>
                )}

                <div
                  className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/sessions/${session._id}`)}
                  >
                    View / Edit
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/sessions/${session._id}/edit`)
                    }
                  >
                    Edit Details
                  </Button>

                  {activeTab === "announcements" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToCancel(session);
                        setCancelModalOpen(true);
                      }}
                      loading={actionLoading === `cancel-${session._id}`}
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

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSessionToCancel(null);
        }}
        title="Cancel Session Announcement"
        message="Are you sure you want to cancel this session announcement? This action cannot be undone."
        confirmText="Cancel Announcement"
        onConfirm={handleCancelSession}
      />
    </DashboardLayout>
  );
};

export default AdminSessions;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  MapPin,
  Video,
  Users,
  ArrowLeft,
  CheckCircle,
  Edit,
  XCircle as XCircleIcon,
  RefreshCw,
  FileText,
  UserCheck,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const AdminSessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("students");

  const fetchSession = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await API.get(`/sessions/${id}`);
      setSession(res.data.session);
    } catch (error) {
      toast.error("Failed to load session");
      navigate("/admin/sessions");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleCancelSession = async () => {
    try {
      setActionLoading("cancel");
      await API.patch(`/sessions/${id}/cancel`);
      toast.success("Session cancelled");
      await fetchSession(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel session");
    } finally {
      setActionLoading(null);
      setCancelModalOpen(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      setActionLoading("complete");
      await API.patch(`/sessions/${id}/complete`);
      toast.success("Session marked as completed");
      await fetchSession(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = async () => {
    await fetchSession(true);
    toast.success("Session details refreshed");
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "requested":
        return "warning";
      case "pending":
        return "warning";
      case "completed":
        return "default";
      case "cancelled":
        return "danger";
      case "approved":
      case "scheduled":
        return "success";
      default:
        return "default";
    }
  };

  const handleApproveExpert = async (requestId) => {
    try {
      setActionLoading(`approve-${requestId}`);
      await API.post(`/sessions/${id}/requests/${requestId}/approve`);
      toast.success('Expert approved successfully');
      fetchSession();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve expert');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectExpert = async (requestId) => {
    try {
      setActionLoading(`reject-${requestId}`);
      await API.post(`/sessions/${id}/requests/${requestId}/reject`);
      toast.success('Expert rejected');
      fetchSession();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject expert');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">
          <Loader size="lg" text="Loading session..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <div className="py-10 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Session not found
              </h3>
              <p className="mb-6 text-gray-600">
                This session may have been removed or is no longer available.
              </p>
              <Button onClick={() => navigate("/admin/sessions")}>
                Back to Sessions
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const students = session.participants || [];
  const studentRequests = (session.pendingRequests?.filter((r) => r.role === "student") || [])
    .filter(req => !students.some(p => String(p._id || p) === String(req.user?._id || req.user)));
  
  const expertRequests = (session.pendingRequests?.filter((r) => r.role === "expert") || [])
    .filter(req => String(req.user?._id || req.user) !== String(session.expert?._id || session.expert));

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/admin/sessions")}
          >
            Back to Sessions
          </Button>

          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={actionLoading !== null}
          >
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {session.title || "Untitled Session"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="primary-outline">
                      {session.moduleCode || "No module"}
                    </Badge>
                    <Badge variant={getStatusVariant(session.status)}>
                      {session.status || "unknown"}
                    </Badge>
                  </div>
                </div>

                <Button
                  size="sm"
                  icon={Edit}
                  onClick={() => navigate(`/admin/sessions/${id}/edit`)}
                >
                  Edit
                </Button>
              </div>

              <p className="mb-6 whitespace-pre-line text-gray-600">
                {session.description || "No description available."}
              </p>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Date</span>
                  </div>
                  <p className="text-gray-900">
                    {session.date ? formatDate(session.date) : "Not scheduled yet"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Time</span>
                  </div>
                  <p className="text-gray-900">
                    {session.startTime
                      ? `${session.startTime} - ${session.endTime || "TBA"}`
                      : "Time not set"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    {session.isOnline ? (
                      <Video className="h-4 w-4 text-gray-500" />
                    ) : (
                      <MapPin className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="font-medium">
                      {session.isOnline ? "Session Mode" : "Venue"}
                    </span>
                  </div>

                  {session.isOnline ? (
                    <div className="space-y-2">
                      <p className="text-gray-900">Online Session</p>
                      {session.meetingLink ? (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <p className="text-gray-500">Meeting link not added yet</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {session.venue || "Venue not assigned yet"}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-gray-700">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Participants</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-900">
                      {session.participants?.length || 0} /{" "}
                      {session.requiredStudents || 0} students
                    </p>
                    <p className="text-gray-900">
                      Required Experts: {session.expert ? 1 : (session.pendingRequests?.filter(r => r.role === 'expert' && r.status === 'pending').length || 0)} / {session.requiredExperts || 1}
                    </p>
                    {session.expert && (
                      <Badge variant="success" size="sm" className="flex w-fit items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Expert assigned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Details</h3>

              <div className="mb-4 flex gap-2 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("students")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeDetailTab === "students"
                      ? "border-primary-600 text-primary-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Students ({students.length + studentRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailTab("experts")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeDetailTab === "experts"
                      ? "border-primary-600 text-primary-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Experts ({(session.expert ? 1 : 0) + expertRequests.length})
                </button>
              </div>

              {activeDetailTab === "students" && (
                <div className="space-y-4">
                  {students.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-700">Joined Students</p>
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div key={student._id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <p className="font-medium text-gray-900">{student.fullName || "Unnamed student"}</p>
                            <p className="text-sm text-gray-600">{student.email || "No email"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {studentRequests.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-700">Student Requests</p>
                      <div className="space-y-2">
                        {studentRequests.map((req) => (
                          <div key={req._id} className="rounded-lg border border-gray-200 bg-white p-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900">{req.user?.fullName || "Unnamed student"}</p>
                              <p className="text-sm text-gray-600">{req.user?.email || "No email"}</p>
                            </div>
                            <Badge variant="default" className="capitalize">{req.status || "pending"}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {students.length === 0 && studentRequests.length === 0 && (
                    <p className="text-sm text-gray-500">No student records available for this session yet.</p>
                  )}
                </div>
              )}

              {activeDetailTab === "experts" && (
                <div className="space-y-4">
                  {session.expert && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-800 mb-1">Assigned Expert</p>
                      <p className="font-medium text-gray-900">{session.expert.fullName || "Unnamed expert"}</p>
                      <p className="text-sm text-gray-700">{session.expert.email || "No email"}</p>
                    </div>
                  )}

                  {expertRequests.length > 0 ? (
                    <div className="space-y-4">
                      {expertRequests.map((req) => (
                        <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{req.user?.fullName || "Unnamed expert"}</p>
                            <p className="text-sm text-gray-600">{req.user?.email || "No email"}</p>
                            {req.reason && (
                              <div className="mt-2 bg-white p-2 rounded border border-gray-100">
                                <span className="font-medium text-xs text-gray-500 uppercase tracking-wider block mb-1">Reason</span>
                                <p className="text-sm text-gray-700">"{req.reason}"</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {req.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  loading={actionLoading === `reject-${req._id}`}
                                  onClick={() => handleRejectExpert(req._id)}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  loading={actionLoading === `approve-${req._id}`}
                                  onClick={() => handleApproveExpert(req._id)}
                                >
                                  Accept
                                </Button>
                              </>
                            ) : req.status === "approved" ? (
                              <Badge variant="success">Accepted</Badge>
                            ) : req.status === "rejected" ? (
                              <Badge variant="danger">Rejected</Badge>
                            ) : (
                              <Badge variant="default" className="capitalize">{req.status}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !session.expert ? (
                    <p className="text-sm text-gray-500">No expert requests yet.</p>
                  ) : null}
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="mb-3 font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => navigate(`/admin/sessions/${id}/edit`)}
                >
                  Edit Session
                </Button>

                {session.status !== "cancelled" && session.status !== "completed" && (
                  <Button
                    fullWidth
                    variant="danger"
                    icon={XCircleIcon}
                    onClick={() => setCancelModalOpen(true)}
                    loading={actionLoading === "cancel"}
                  >
                    Cancel Session
                  </Button>
                )}

                {(session.status === "pending" || session.status === "approved") && (
                  <Button
                    fullWidth
                    onClick={handleMarkCompleted}
                    loading={actionLoading === "complete"}
                    disabled={actionLoading === "cancel"}
                  >
                    Mark Completed
                  </Button>
                )}

                <Button fullWidth onClick={() => navigate("/admin/sessions")}>
                  Back to List
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Session Announcement"
        message="Are you sure you want to cancel this session announcement? This action cannot be undone."
        confirmText="Cancel Announcement"
        onConfirm={handleCancelSession}
      />
    </DashboardLayout>
  );
};

export default AdminSessionDetail;
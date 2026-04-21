import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import API from "../../utils/api";
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Shield,
  MessageSquare,
  ArrowRight,
  UserPlus,
  Eye,
  Award,
} from "lucide-react";
import { formatDate } from "../../utils/helpers";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalExperts: 0,
    totalLecturers: 0,
    pendingExperts: 0,
    activeExperts: 0,
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalResources: 0,
    pendingResources: 0,
    approvedResources: 0,
    totalGroups: 0,
    totalPosts: 0,
  });

  const [pendingExperts, setPendingExperts] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all user counts
      const [
        allUsersRes,
        studentsRes,
        expertsRes,
        lecturersRes,
        pendingExpertsRes,
        sessionsRes,
        resourcesRes,
      ] = await Promise.all([
        // All users
        API.get("/users").catch(() => ({ data: { users: [] } })),
        // Students
        API.get("/users?role=student").catch(() => ({ data: { users: [] } })),
        // All experts (active)
        API.get("/users?role=expert&status=active").catch(() => ({
          data: { users: [] },
        })),
        // Lecturers
        API.get("/users?role=lecturer").catch(() => ({ data: { users: [] } })),
        // Pending experts
        API.get("/users?role=expert&status=pending").catch(() => ({
          data: { users: [] },
        })),
        // Sessions
        API.get("/sessions").catch(() => ({ data: { sessions: [] } })),
        // Resources
        API.get("/resources").catch(() => ({ data: { resources: [] } })),
      ]);

      const allUsers = allUsersRes.data.users || [];
      const students = studentsRes.data.users || [];
      const experts = expertsRes.data.users || [];
      const lecturers = lecturersRes.data.users || [];
      const pendingExpertsData = pendingExpertsRes.data.users || [];
      const sessions = sessionsRes.data.sessions || [];
      const resources = resourcesRes.data.resources || [];

      // Calculate stats
      setStats({
        totalUsers: allUsers.length,
        totalStudents: students.length,
        totalExperts: experts.length,
        totalLecturers: lecturers.length,
        pendingExperts: pendingExpertsData.length,
        activeExperts: experts.length,
        totalSessions: sessions.length,
        activeSessions: sessions.filter(
          (s) => s.status === "confirmed" || s.status === "active",
        ).length,
        completedSessions: sessions.filter((s) => s.status === "completed")
          .length,
        totalResources: resources.length,
        pendingResources: resources.filter((r) => r.status === "pending")
          .length,
        approvedResources: resources.filter((r) => r.status === "approved")
          .length,
        totalGroups: 0, // Will be updated when groups API is ready
        totalPosts: 0, // Will be updated when posts API is ready
      });

      // Set pending experts (limit to 5)
      setPendingExperts(pendingExpertsData.slice(0, 5));

      // Set pending resources (limit to 5)
      setPendingResources(
        resources.filter((r) => r.status === "pending").slice(0, 5),
      );

      // Set upcoming sessions (limit to 5)
      const upcoming = sessions
        .filter((s) => s.status === "confirmed")
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
      setUpcomingSessions(upcoming);

      // Create recent activities
      const activities = [];

      if (pendingExpertsData.length > 0) {
        activities.push({
          id: "expert-" + Date.now(),
          type: "expert_application",
          description: `${pendingExpertsData.length} new expert application${pendingExpertsData.length > 1 ? "s" : ""} received`,
          time: "Recent",
        });
      }

      if (resources.filter((r) => r.status === "pending").length > 0) {
        activities.push({
          id: "resource-" + Date.now(),
          type: "resource_upload",
          description: `${resources.filter((r) => r.status === "pending").length} resource${resources.filter((r) => r.status === "pending").length > 1 ? "s" : ""} awaiting approval`,
          time: "Recent",
        });
      }

      if (sessions.filter((s) => s.status === "confirmed").length > 0) {
        activities.push({
          id: "session-" + Date.now(),
          type: "session_created",
          description: `${sessions.filter((s) => s.status === "confirmed").length} upcoming session${sessions.filter((s) => s.status === "confirmed").length > 1 ? "s" : ""}`,
          time: "Today",
        });
      }

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading admin dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.fullName}! Here's your system overview.
          </p>
        </div>

        {/* Stats Cards Row 1 - Users */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Users */}
          <Card
            className="bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/users")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers}
                </h3>
                <p className="text-xs text-gray-500 mt-1">All registered</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary-600" />
              </div>
            </div>
          </Card>

          {/* Students */}
          <Card
            className="bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/users?role=student")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Students</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalStudents}
                </h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Experts */}
          <Card
            className="bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/users?role=expert")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Experts</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalExperts}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Active experts</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Pending Expert Approvals */}
          <Card
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/expert-queue")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">Pending Experts</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.pendingExperts}
                </h3>
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Needs review
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-yellow-200 flex items-center justify-center">
                <UserCheck className="w-7 h-7 text-yellow-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards Row 2 - Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Total Sessions */}
          <Card
            className="bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/sessions")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalSessions}
                </h3>
                <p className="text-xs text-gray-500 mt-1">All sessions</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Active Sessions */}
          <Card className="bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.activeSessions}
                </h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Currently running
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Total Resources */}
          <Card
            className="bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/resources")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resources</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.totalResources}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Total uploads</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </Card>

          {/* Pending Resources */}
          <Card
            className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/resources?status=pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 mb-1">Pending Resources</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.pendingResources}
                </h3>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Needs approval
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-red-200 flex items-center justify-center">
                <FileText className="w-7 h-7 text-red-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Expert Applications */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary-600" />
                  Pending Expert Applications
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate("/admin/expert-queue")}
                >
                  View All
                </Button>
              </div>

              {pendingExperts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No pending expert applications
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingExperts.map((expert) => (
                    <div
                      key={expert._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/expert-queue/${expert._id}`)
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-bold text-lg">
                              {expert.fullName?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {expert.fullName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {expert.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="info" size="sm">
                                Year {expert.yearLevel}
                              </Badge>
                              <Badge variant="primary-outline" size="sm">
                                {expert.specialization}
                              </Badge>
                              {expert.gpa && (
                                <Badge variant="success" size="sm">
                                  GPA: {expert.gpa}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Pending Resources */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Pending Resource Approvals
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate("/admin/resources?status=pending")}
                >
                  View All
                </Button>
              </div>

              {pendingResources.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500">No pending resources</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingResources.map((resource) => (
                    <div
                      key={resource._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-all cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/resources/${resource._id}`)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="primary-outline" size="sm">
                              {resource.moduleCode}
                            </Badge>
                            <Badge variant="default" size="sm">
                              {resource.resourceType}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            By {resource.uploader?.fullName} •{" "}
                            {formatDate(resource.createdAt)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" icon={Eye}>
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  Upcoming Sessions
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate("/admin/sessions")}
                >
                  View All
                </Button>
              </div>

              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {session.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {session.moduleCode}
                          </p>
                        </div>
                        <Badge variant="success">Confirmed</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          {session.date ? formatDate(session.date) : "Date TBA"}
                        </span>
                        <span>•</span>
                        <span>
                          {session.participants?.length || 0} students
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  icon={UserCheck}
                  onClick={() => navigate("/admin/expert-queue")}
                >
                  Review Experts ({stats.pendingExperts})
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={FileText}
                  onClick={() => navigate("/admin/resources?status=pending")}
                >
                  Approve Resources ({stats.pendingResources})
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={Users}
                  onClick={() => navigate("/users")}
                >
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={Calendar}
                  onClick={() => navigate("/admin/sessions")}
                >
                  View Sessions
                </Button>
              </div>
            </Card>

            {/* System Stats */}
            <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                System Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Lecturers</span>
                  <span className="font-bold text-gray-900">
                    {stats.totalLecturers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Completed Sessions
                  </span>
                  <span className="font-bold text-gray-900">
                    {stats.completedSessions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Approved Resources
                  </span>
                  <span className="font-bold text-gray-900">
                    {stats.approvedResources}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Active Experts</span>
                  <span className="font-bold text-gray-900">
                    {stats.activeExperts}
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Recent Activity
              </h3>
              {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-l-2 border-primary-500 pl-3 py-2"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

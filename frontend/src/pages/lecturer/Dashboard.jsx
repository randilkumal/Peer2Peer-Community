// Dashboard.jsx
// Component: Lecturer Dashboard
// Purpose: Landing page for authenticated lecturers. Shows active group tables,
//          unregistered student alerts, upcoming deadlines, and module stats.
// Author: [Your Name]
// Last Modified: [Date]

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import API from '../../utils/api';
import { 
  Users, 
  CalendarClock, 
  Clock, 
  PlusCircle, 
  BookOpen, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  // Get the currently authenticated lecturer's profile
  const { user } = useAuth();
  const navigate = useNavigate();

  // loading: true while fetching all dashboard data from the API
  const [loading, setLoading] = useState(true);

  // dashboardData holds three derived datasets:
  //   activeProjects    — open group assignments for this lecturer
  //   unregisteredStats — projects that still have unassigned students
  //   upcomingDeadlines — next 3 closest deadlines from active projects
  const [dashboardData, setDashboardData] = useState({
    activeProjects: [],
    unregisteredStats: [],
    upcomingDeadlines: []
  });

  // Fetch dashboard data once when the component mounts
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all projects belonging to this lecturer
      const res = await API.get('/groups/projects');
      const projects = res.data.projects || [];

      // Filter to only open (active) projects
      const active = projects.filter(p => p.status === 'open');

      // Sort active projects by deadline ascending and take the nearest 3
      const upcoming = [...active]
        .sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline))
        .slice(0, 3);

      // For each active project, fetch the count of unassigned students.
      // Only include projects where at least one student is unassigned.
      const stats = [];
      for (const p of active) {
        try {
          const uRes = await API.get(`/groups/project/${p._id}/unassigned`);
          const unassignedCount = uRes.data.unassigned?.length || 0;
          if (unassignedCount > 0) {
            stats.push({ project: p, count: unassignedCount });
          }
        } catch (e) {
          // Log per-project errors without blocking the rest of the loop
          console.error(`Error fetching unassigned for ${p._id}`);
        }
      }

      setDashboardData({
        activeProjects: active,
        unregisteredStats: stats,
        upcomingDeadlines: upcoming
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false); // Always reset loading regardless of success or failure
    }
  };

  // Show a full-page loader while data is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader size="lg" text="Loading your dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">

        {/* ── Welcome Header ───────────────────────────────────────────────── */}
        {/* Greets lecturer by title + last name; falls back to full name */}
        <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.title || 'Dr.'} {user?.fullName?.split(' ')[1] || user?.fullName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here is an overview of your active group assignments and pending tasks.
            </p>
          </div>
          {/* Shortcut button to the group table creation page */}
          <Button icon={PlusCircle} onClick={() => navigate('/lecturer/groups')}>
            Create Group Table
          </Button>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Card 1: Total active (open) group tables */}
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80 mb-1">Active Group Tables</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-bold">{dashboardData.activeProjects.length}</h3>
                </div>
                <p className="text-sm text-white/80 mt-1">Assignments waiting for students</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          {/* Card 2: Sum of unassigned students across all active projects */}
          <Card className="bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Unregistered</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-bold text-gray-900">
                    {dashboardData.unregisteredStats.reduce((sum, s) => sum + s.count, 0)}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Total students across modules</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          {/* Card 3: Number of modules assigned to this lecturer */}
          <Card className="bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Modules</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-bold text-gray-900">
                    {user?.teachingModules?.length || 0}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Currently assigned to you</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Main Grid: Active Tables (left) + Sidebar (right) ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Active Group Tables list ────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Active Group Tables</h2>
                {/* Link to full group management page */}
                <Button variant="ghost" size="sm" onClick={() => navigate('/lecturer/groups')}>
                  Manage All →
                </Button>
              </div>

              {/* Empty state when no active projects exist */}
              {dashboardData.activeProjects.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">You have no active group assignments.</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/lecturer/groups')}>
                    Create Assignment
                  </Button>
                </div>
              ) : (
                // Show up to 5 active projects
                <div className="space-y-4">
                  {dashboardData.activeProjects.slice(0, 5).map((project) => {
                    // Calculate days remaining until the registration deadline
                    const diffDays = Math.ceil((new Date(project.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                    const isClosingSoon = diffDays > 0 && diffDays <= 3; // Warn if ≤ 3 days left
                    const isClosed = diffDays <= 0;                       // Treat past deadline as closed

                    return (
                      <div
                        key={project._id}
                        className="bg-white border rounded-lg p-5 hover:border-primary-300 transition-colors shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{project.assignmentTitle}</h3>
                              {/* Badge color: red = closed, orange = closing soon, green = open */}
                              <Badge variant={isClosed ? 'danger' : isClosingSoon ? 'warning' : 'success'} size="sm">
                                {isClosed ? 'Closed' : isClosingSoon ? 'Closing Soon' : 'Open'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{project.module}</p>
                          </div>
                          {/* Shows total number of groups for this assignment */}
                          <Badge variant="default">{project.numberOfGroups} Groups</Badge>
                        </div>

                        {/* Deadline and group size summary row */}
                        <div className="flex gap-4 text-sm text-gray-600 border-t pt-3 mt-3">
                          <div className="flex items-center gap-1">
                            <CalendarClock className="w-4 h-4 text-gray-400" />
                            <span>Deadline: {formatDate(project.registrationDeadline)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>Size: {project.groupSize} / group</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── Right Column: Action Required + Deadlines ────────────────── */}
          <div className="space-y-6">

            {/* Card: Unregistered student alerts per project */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Action Required
              </h2>

              {/* All-clear state when every student is assigned */}
              {dashboardData.unregisteredStats.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">All students are assigned! 🎉</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.unregisteredStats.map((stat) => (
                    <div key={stat.project._id} className="p-3 border rounded-lg bg-orange-50/50 border-orange-100">
                      <p className="font-semibold text-gray-900 text-sm mb-1">{stat.project.assignmentTitle}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600 text-truncate">{stat.project.module}</p>
                        {/* Shows exact number of unassigned students for this project */}
                        <Badge variant="warning">{stat.count} missing</Badge>
                      </div>
                      {/* Auto-Assign navigates to the group management page */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 text-xs py-1"
                        onClick={() => navigate('/lecturer/groups')}
                      >
                        Auto-Assign
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Card: Upcoming registration deadlines (nearest 3) */}
            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Deadlines
              </h2>

              {dashboardData.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.upcomingDeadlines.map((p) => {
                    // Days remaining: negative = already passed
                    const days = Math.ceil((new Date(p.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={p._id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.assignmentTitle}</p>
                          <p className="text-xs text-gray-500">{formatDate(p.registrationDeadline)}</p>
                        </div>
                        {/* Pill color: red = passed, orange = ≤3 days, green = plenty of time */}
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          days < 0 ? 'bg-red-100 text-red-700' :
                          days <= 3 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {days < 0 ? 'Passed' : days === 0 ? 'Today' : `In ${days} days`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
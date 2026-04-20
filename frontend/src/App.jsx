import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";

// Public pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Help from "./pages/public/Help";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student pages (implemented)
import Dashboard from "./pages/student/Dashboard";
import Resources from "./pages/student/Resources";
import StudentResourceDetail from "./pages/student/ResourceDetail";
import Chat from "./pages/student/Chat";

// Lecturer pages
import LecturerGroups from "./pages/lecturer/Groups";
import CreateGroupTable from "./pages/lecturer/CreateGroupTable";
import LecturerGroupTable from "./pages/lecturer/GroupTable";
import GroupTableDetail from "./pages/lecturer/GroupTableDetail";
import LecturerDashboard from "./pages/lecturer/Dashboard";
import LecturerProfile from "./pages/lecturer/Profile";
import LecturerModules from "./pages/lecturer/Modules";
import ModuleDetails from "./pages/lecturer/ModuleDetails";
import AdminGroups from "./pages/admin/Groups";
import AdminGroupTable from "./pages/admin/GroupTable";
import StudentGroupTable from "./pages/student/GroupTable";

// General account pages
import Profile from "./pages/Profile";
import Modules from "./pages/Modules";

// Placeholder pages (to be implemented)
import Groups from "./pages/student/Groups";

// Session pages
import AdminSessions from "./pages/admin/Sessions";
import AdminSessionDetail from "./pages/admin/SessionDetail";
import AdminCreateSession from "./pages/admin/CreateSession";
import AdminEditSessionDetails from "./pages/admin/EditSessionDetails";

import StudentSessions from "./pages/student/Sessions";
import StudentSessionDetail from "./pages/student/SessionDetail";
import ExpertDashboard from "./pages/expert/Dashboard";
import ExpertSessionHistory from "./pages/expert/SessionHistory";
import ExpertJoinedSessions from "./pages/expert/JoinedSessions";
import ExpertConductedSessions from "./pages/expert/ConductedSessions";

import AdminResources from "./pages/admin/Resources";
import AdminResourceDetail from "./pages/admin/ResourceDetail";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApprovalQueue from "./pages/admin/ExpertQueue";
import AdminExpertDetail from "./pages/admin/ExpertDetail";
import ToBeImplemented from "./pages/ToBeImplemented";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />
        <Route
          path="/help"
          element={
            <PublicLayout>
              <Help />
            </PublicLayout>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        {/* Register: redirect to login (to be implemented) */}
        <Route path="/register" element={<Register />} />

        {/* Main App Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              user?.role === "lecturer" ? (
                <LecturerDashboard />
              ) : user?.role === "admin" ? (
                <AdminDashboard />
              ) : user?.role === "expert" ? (
                <ExpertDashboard />
              ) : (
                <Dashboard />
              )
            }
          />
          <Route
            path="/expert/dashboard"
            element={
              <ProtectedRoute allowedRoles={["expert"]}>
                <ExpertDashboard />
              </ProtectedRoute>
            }
          />

          {/* Resources - Shared route but handled by role wrapper */}
          <Route
            path="/resources"
            element={
              <ProtectedRoute allowedRoles={["student", "expert", "admin"]}>
                {user?.role === "admin" ? <AdminResources /> : <Resources />}
              </ProtectedRoute>
            }
          />

          {/* Admin Resource Alias */}
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResources />
              </ProtectedRoute>
            }
          />

          {/* Resource Detail - Role specific */}
          <Route
            path="/student/resources"
            element={
              <ProtectedRoute allowedRoles={["student", "expert"]}>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/resources/:id"
            element={
              <ProtectedRoute allowedRoles={["student", "expert"]}>
                <StudentResourceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResourceDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/groups"
            element={
              user?.role === "lecturer" ? (
                <LecturerGroups />
              ) : user?.role === "admin" ? (
                <AdminGroups />
              ) : (
                <Groups />
              )
            }
          />
          <Route
            path="/student/groups"
            element={
              <ProtectedRoute allowedRoles={["student", "expert"]}>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute allowedRoles={["student", "expert"]}>
                <StudentGroupTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/groups/:id"
            element={
              <ProtectedRoute allowedRoles={["student", "expert"]}>
                <StudentGroupTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminGroupTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/groups"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/groups/create"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <CreateGroupTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/groups/:id"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <GroupTableDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/profile"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/modules"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <LecturerModules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/modules/:code"
            element={
              <ProtectedRoute allowedRoles={["lecturer"]}>
                <ModuleDetails />
              </ProtectedRoute>
            }
          />

          {/* Admin Sessions */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route
              path="/admin/sessions/create"
              element={<AdminCreateSession />}
            />
            <Route
              path="/admin/sessions/:id"
              element={<AdminSessionDetail />}
            />
            <Route
              path="/admin/sessions/:id/edit"
              element={<AdminEditSessionDetails />}
            />
            <Route
              path="/admin/expert-queue/:id"
              element={<AdminExpertDetail />}
            />
          </Route>

          {/* Student Sessions */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route
              path="/student/sessions/:id"
              element={<StudentSessionDetail />}
            />
          </Route>

          {/* Expert Sessions */}
          <Route element={<ProtectedRoute allowedRoles={["expert"]} />}>
            <Route
              path="/expert/session-history"
              element={<ExpertSessionHistory />}
            />
            <Route
              path="/expert/joined-sessions"
              element={<ExpertJoinedSessions />}
            />
            <Route
              path="/expert/conducted-sessions"
              element={<ExpertConductedSessions />}
            />
            <Route
              path="/expert/sessions/:id"
              element={<StudentSessionDetail />}
            />
          </Route>

          {/* Additional Features (Placeholders) */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/profile"
              element={
                user?.role === "lecturer" ? <LecturerProfile /> : <Profile />
              }
            />
            <Route path="/settings" element={<ToBeImplemented />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/feed" element={<ToBeImplemented />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ToBeImplemented />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expert-queue"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminApprovalQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/expert-queue"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminApprovalQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules"
              element={
                <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                  {user?.role === "lecturer" ? (
                    <LecturerModules />
                  ) : (
                    <Modules />
                  )}
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* 404 → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;

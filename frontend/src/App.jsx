import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import Login from './pages/auth/Login'

// Student pages (implemented)
import Dashboard from './pages/student/Dashboard'
import Resources from './pages/student/Resources'
import StudentResourceDetail from './pages/student/ResourceDetail'
import Chat from './pages/student/Chat'

// Placeholder pages (to be implemented)
import Groups from './pages/student/Groups'

// Session pages
import AdminSessions from './pages/admin/Sessions'
import AdminSessionDetail from './pages/admin/SessionDetail'
import AdminCreateSession from './pages/admin/CreateSession'
import AdminEditSessionDetails from './pages/admin/EditSessionDetails'

import StudentSessions from './pages/student/Sessions'
import StudentSessionDetail from './pages/student/SessionDetail'

import ExpertSessionHistory from './pages/expert/SessionHistory'
import ExpertJoinedSessions from './pages/expert/JoinedSessions'
import ExpertConductedSessions from './pages/expert/ConductedSessions'

import AdminResources from './pages/admin/Resources'
import AdminResourceDetail from './pages/admin/ResourceDetail'
import ToBeImplemented from './pages/ToBeImplemented'

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Routes>
        {/* Default: redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        {/* Register: redirect to login (to be implemented) */}
        <Route path="/register" element={<Navigate to="/login" replace />} />
        
        {/* Main App Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Resources - Shared route but handled by role wrapper */}
          <Route 
            path="/resources" 
            element={
              <ProtectedRoute allowedRoles={['student', 'expert', 'admin']}>
                {user?.role === 'admin' ? <AdminResources /> : <Resources />}
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Resource Alias */}
          <Route 
            path="/admin/resources" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResources />
              </ProtectedRoute>
            } 
          />
          
          {/* Resource Detail - Role specific */}
          <Route path="/student/resources/:id" element={<ProtectedRoute allowedRoles={['student', 'expert']}><StudentResourceDetail /></ProtectedRoute>} />
          <Route path="/admin/resources/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminResourceDetail /></ProtectedRoute>} />

          <Route path="/groups" element={<Groups />} />
          
          {/* Admin Sessions */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/sessions/create" element={<AdminCreateSession />} />
            <Route path="/admin/sessions/:id" element={<AdminSessionDetail />} />
            <Route path="/admin/sessions/:id/edit" element={<AdminEditSessionDetails />} />
          </Route>

          {/* Student Sessions */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/sessions" element={<StudentSessions />} />
            <Route path="/student/sessions/:id" element={<StudentSessionDetail />} />
          </Route>

          {/* Expert Sessions */}
          <Route element={<ProtectedRoute allowedRoles={['expert']} />}>
            <Route path="/expert/session-history" element={<ExpertSessionHistory />} />
            <Route path="/expert/joined-sessions" element={<ExpertJoinedSessions />} />
            <Route path="/expert/conducted-sessions" element={<ExpertConductedSessions />} />
            <Route path="/expert/sessions/:id" element={<StudentSessionDetail />} />
          </Route>

          {/* Additional Features (Placeholders) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ToBeImplemented />} />
            <Route path="/settings" element={<ToBeImplemented />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/feed" element={<ToBeImplemented />} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><ToBeImplemented /></ProtectedRoute>} />
            <Route path="/expert-queue" element={<ProtectedRoute allowedRoles={['admin']}><ToBeImplemented /></ProtectedRoute>} />
            <Route path="/modules" element={<ProtectedRoute allowedRoles={['lecturer', 'admin']}><ToBeImplemented /></ProtectedRoute>} />
          </Route>
        </Route>

        {/* 404 → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
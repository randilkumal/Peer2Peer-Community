import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'

// Public landing pages
import Home from './pages/public/Home'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard page
import Dashboard from './pages/student/Dashboard'
import Sessions from './pages/student/Sessions'
import Resources from './pages/student/Resources'
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          {/* Public Landing Page */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main App Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<ProtectedRoute allowedRoles={['student', 'expert']}><Resources /></ProtectedRoute>} />
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
          </Route>

          
          {/* Default & 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}


export default App
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import Login from './pages/auth/Login'

// Student pages (implemented)
import Dashboard from './pages/student/Dashboard'
import Resources from './pages/student/Resources'

// Placeholder pages (to be implemented)
import Sessions from './pages/student/Sessions'
import Groups from './pages/student/Groups'

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
          {/* Default: redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          {/* Register: redirect to login (to be implemented) */}
          <Route path="/register" element={<Navigate to="/login" replace />} />
          
          {/* Main App Routes (Protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<Resources />} />
            {/* Placeholder routes */}
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/groups" element={<Groups />} />
          </Route>

          {/* 404 → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
#!/usr/bin/env python3
import os

BASE = "/home/claude/p2p-final"
os.chdir(BASE)

files = {}

# MAIN FILES
files["src/main.jsx"] = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)"""

files["src/index.css"] = """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
    font-family: 'Inter', sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50;
  }
  .input-field {
    @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none;
  }
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}"""

files["src/App.jsx"] = """import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

// Import all pages (they're empty for now, you'll ask for code)
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentSessions from './pages/student/Sessions'
import StudentSessionDetail from './pages/student/SessionDetail'
import StudentResources from './pages/student/Resources'
import StudentResourceDetail from './pages/student/ResourceDetail'
import StudentGroups from './pages/student/Groups'
import StudentGroupTable from './pages/student/GroupTable'
import StudentChat from './pages/student/Chat'
import StudentSettings from './pages/student/Settings'

import ExpertDashboard from './pages/expert/Dashboard'
import ExpertProfile from './pages/expert/Profile'
import ExpertConductedSessions from './pages/expert/ConductedSessions'
import ExpertJoinedSessions from './pages/expert/JoinedSessions'
import ExpertSessionHistory from './pages/expert/SessionHistory'

import LecturerDashboard from './pages/lecturer/Dashboard'
import LecturerProfile from './pages/lecturer/Profile'
import LecturerGroups from './pages/lecturer/Groups'
import LecturerCreateGroupTable from './pages/lecturer/CreateGroupTable'
import LecturerGroupTableDetail from './pages/lecturer/GroupTableDetail'
import LecturerUnregisteredStudents from './pages/lecturer/UnregisteredStudents'
import LecturerManualAssignment from './pages/lecturer/ManualAssignment'
import LecturerPublishGroups from './pages/lecturer/PublishGroups'
import LecturerModules from './pages/lecturer/Modules'
import LecturerModuleDetail from './pages/lecturer/ModuleDetail'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminExpertQueue from './pages/admin/ExpertQueue'
import AdminExpertDetail from './pages/admin/ExpertDetail'
import AdminSessions from './pages/admin/Sessions'
import AdminSessionDetail from './pages/admin/SessionDetail'
import AdminCreateSession from './pages/admin/CreateSession'
import AdminEditSessionDetails from './pages/admin/EditSessionDetails'
import AdminResources from './pages/admin/Resources'
import AdminResourceDetail from './pages/admin/ResourceDetail'
import AdminGroups from './pages/admin/Groups'
import AdminFeed from './pages/admin/Feed'
import AdminSettings from './pages/admin/Settings'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/sessions" element={<StudentSessions />} />
          <Route path="/student/sessions/:id" element={<StudentSessionDetail />} />
          <Route path="/student/resources" element={<StudentResources />} />
          <Route path="/student/resources/:id" element={<StudentResourceDetail />} />
          <Route path="/student/groups" element={<StudentGroups />} />
          <Route path="/student/groups/:moduleCode" element={<StudentGroupTable />} />
          <Route path="/student/chat" element={<StudentChat />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          
          {/* Expert Routes */}
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/expert/profile" element={<ExpertProfile />} />
          <Route path="/expert/conducted-sessions" element={<ExpertConductedSessions />} />
          <Route path="/expert/joined-sessions" element={<ExpertJoinedSessions />} />
          <Route path="/expert/history" element={<ExpertSessionHistory />} />
          
          {/* Lecturer Routes */}
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/profile" element={<LecturerProfile />} />
          <Route path="/lecturer/groups" element={<LecturerGroups />} />
          <Route path="/lecturer/groups/create" element={<LecturerCreateGroupTable />} />
          <Route path="/lecturer/groups/:id" element={<LecturerGroupTableDetail />} />
          <Route path="/lecturer/groups/:id/unregistered" element={<LecturerUnregisteredStudents />} />
          <Route path="/lecturer/groups/:id/manual-assign" element={<LecturerManualAssignment />} />
          <Route path="/lecturer/groups/:id/publish" element={<LecturerPublishGroups />} />
          <Route path="/lecturer/modules" element={<LecturerModules />} />
          <Route path="/lecturer/modules/:code" element={<LecturerModuleDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/expert-queue" element={<AdminExpertQueue />} />
          <Route path="/admin/expert-queue/:id" element={<AdminExpertDetail />} />
          <Route path="/admin/sessions" element={<AdminSessions />} />
          <Route path="/admin/sessions/:id" element={<AdminSessionDetail />} />
          <Route path="/admin/sessions/create" element={<AdminCreateSession />} />
          <Route path="/admin/sessions/:id/edit" element={<AdminEditSessionDetails />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/resources/:id" element={<AdminResourceDetail />} />
          <Route path="/admin/groups" element={<AdminGroups />} />
          <Route path="/admin/feed" element={<AdminFeed />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App"""

# UTILS
files["src/utils/api.js"] = """import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;"""

files["src/utils/constants.js"] = """export const ROLES = {
  STUDENT: 'student',
  EXPERT: 'expert',
  LECTURER: 'lecturer',
  ADMIN: 'admin',
};

export const STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  INACTIVE: 'inactive',
};

export const SESSION_STATUS = {
  REQUESTED: 'requested',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RESOURCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const SPECIALIZATIONS = ['IT', 'SE', 'DS', 'CSNE'];
export const PERIODS = ['Jan-May', 'Jun-Nov'];
export const YEAR_LEVELS = [1, 2, 3, 4];
export const SEMESTERS = [1, 2];

export const RESOURCE_TYPES = ['Notes', 'Assignment', 'Past Paper', 'Other'];"""

files["src/utils/helpers.js"] = """import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str, length = 100) => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    pending: 'yellow',
    rejected: 'red',
    inactive: 'gray',
    requested: 'blue',
    confirmed: 'green',
    completed: 'purple',
    cancelled: 'red',
    approved: 'green',
  };
  return colors[status] || 'gray';
};"""

files["src/utils/validators.js"] = """export const validateEmail = (email) => {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateStudentId = (id) => {
  return id && id.length >= 8 && id.length <= 10;
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/[\\s-]/g, ''));
};

export const validateGPA = (gpa) => {
  const num = parseFloat(gpa);
  return !isNaN(num) && num >= 0 && num <= 4.0;
};"""

# CONTEXT
files["src/context/AuthContext.jsx"] = """import { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const register = async (data) => {
    const response = await API.post('/auth/register', data);
    if (response.data.token) {
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUser,
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};"""

# HOOKS
files["src/hooks/useApi.js"] = """import { useState, useEffect } from 'react';
import API from '../utils/api';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get(endpoint);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.skip) return;
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};"""

files["src/hooks/useForm.js"] = """import { useState } from 'react';

export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, loading, handleChange, handleSubmit, reset, setValues, setErrors };
};"""

# Write all files
print()
print("📦 Phase 2: Creating infrastructure files...")
print()

for filepath, content in files.items():
    full_path = os.path.join(BASE, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\\n')
    print(f"✅ {filepath}")

print()
print(f"✅ Created {len(files)} infrastructure files")
print()


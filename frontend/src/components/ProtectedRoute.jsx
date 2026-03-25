import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { loading, hasUser: !!user, userRole: user?.role });

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 No user - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('🚫 Unauthorized role - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and authorized
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
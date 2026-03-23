// Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  User, 
  Calendar, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings,
  UserCheck,
  BookOpen,
  Shield,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation links based on role
  const getNavigationLinks = () => {
    if (!user) return [];

    const baseLinks = {
      student: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/profile', icon: User, label: 'Profile' },
        { to: '/student/sessions', icon: Calendar, label: 'Sessions' },
        { to: '/resources', icon: FileText, label: 'Resources' },
        { to: '/groups', icon: Users, label: 'Groups' },
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ],
      expert: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/profile', icon: User, label: 'Profile' },
        { to: '/expert/joined-sessions', icon: Calendar, label: 'Sessions' },
        { to: '/resources', icon: FileText, label: 'Resources' },
        { to: '/groups', icon: Users, label: 'Groups' },
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ],
      lecturer: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/profile', icon: User, label: 'Profile' },
        { to: '/groups', icon: Users, label: 'Groups' },
        { to: '/modules', icon: BookOpen, label: 'Modules' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ],
      admin: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/expert-queue', icon: UserCheck, label: 'Approval Queue' },
        { to: '/admin/sessions', icon: Calendar, label: 'Sessions' },
        { to: '/resources', icon: FileText, label: 'Resources' },
        { to: '/groups', icon: Shield, label: 'Groups' },
        { to: '/feed', icon: MessageSquare, label: 'Feed' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ],
    };

    return baseLinks[user.role] || [];
  };

  const navigationLinks = getNavigationLinks();
  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col flex-shrink-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 p-2.5 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">Academic</h1>
            <p className="text-sm text-gray-600">Portal</p>
          </div>
        </div>
      </div>



      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(link.to)
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive(link.to) ? 'text-primary-600' : 'text-gray-500'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
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
        { to: '/chat', icon: MessageSquare, label: 'Chat' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ],
    };

    return baseLinks[user.role] || [];
  };

  const navigationLinks = getNavigationLinks();
  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <aside className="w-72 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-r border-gray-200 h-screen sticky top-0 flex flex-col flex-shrink-0 shadow-sm">
      {/* Logo/Brand */}
      <div className="h-24 px-6 border-b border-gray-100 flex items-center pt-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2.5 rounded-xl shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-base text-gray-900 leading-tight">Academic Portal</h1>
            <p className="text-xs text-gray-500">Collaboration workspace</p>
          </div>
        </div>
      </div>



      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(link.to)
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive(link.to) ? 'text-primary-600' : 'text-gray-500'}`} />
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
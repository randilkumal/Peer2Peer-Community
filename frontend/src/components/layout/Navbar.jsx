import { useState } from 'react';
import { Bell, ChevronDown, Search, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfileRoute = () => {
    return '/profile';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/50 bg-gray-50/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between gap-6 pt-4">
          
          {/* Left section: Greeting */}
          <div className="flex-1 hidden sm:block">
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              {getGreeting()}, {user.fullName?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">Here's what's happening in your workspace today.</p>
          </div>

          {/* Middle section: Search Bar (Cosmetic) */}
          <div className="flex-1 max-w-lg hidden lg:block relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Quick search..."
              className="block w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-100 hover:bg-gray-200/60 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all placeholder:text-gray-500 outline-none shadow-inner"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-200 shadow-sm">
                <Command className="w-3 h-3" /> K
              </div>
            </div>
          </div>

          {/* Right section: Actions & Profile */}
          <div className="flex items-center gap-4 md:gap-5 justify-end">
              {/* Notifications */}
              <button className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                {/* Notification Badge */}
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              </button>

              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {user.fullName || 'User'}
                    </p>
                    <p className="text-[11px] font-medium text-primary-600 capitalize">
                      {user.role === 'expert' ? 'Expert Student' : user.role}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 p-[2px] shadow-sm">
                      <div className="w-full h-full rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-700 font-bold text-sm">
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Active Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    ></div>

                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 py-2 z-20 transform transition-all">
                      <div className="px-4 py-3 border-b border-gray-100/50">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email || 'user@example.com'}</p>
                        {user.yearLevel && user.specialization && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary-50 border border-primary-100">
                            <span className="text-[10px] font-semibold text-primary-700">Yr {user.yearLevel}</span>
                            <span className="w-1 h-1 rounded-full bg-primary-300"></span>
                            <span className="text-[10px] font-semibold text-primary-700">{user.specialization}</span>
                          </div>
                        )}
                      </div>

                      <div className="py-2 px-2 space-y-1">
                        <button
                          onClick={() => {
                            navigate(getProfileRoute());
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100/80 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100/80 transition-colors"
                        >
                          Account Settings
                        </button>
                      </div>

                      <div className="border-t border-gray-100/50 pt-2 px-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
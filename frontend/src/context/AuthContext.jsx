import { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

// Normalize user object so frontend can always rely on user._id
const normalizeUser = (user) => {
  if (!user) return user;
  const _id = user._id || user.id;
  const idStr = _id != null ? String(_id) : undefined;
  return { ...user, _id, ...(idStr ? { id: idStr } : {}) };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('🔐 AuthContext - Loading user:', { 
          hasToken: !!token, 
          hasSavedUser: !!savedUser 
        });
        
        if (token && savedUser) {
          // First set from localStorage for immediate display
          const parsedUser = normalizeUser(JSON.parse(savedUser));
          console.log('📦 Setting user from localStorage:', parsedUser._id);
          setUser(parsedUser);
          
          // Then verify with backend (don't block on this)
          API.get('/auth/me')
            .then(response => {
              console.log('✅ Backend verification successful');
              const verifiedUser = normalizeUser(response.data.user);
              setUser(verifiedUser);
              localStorage.setItem('user', JSON.stringify(verifiedUser));
            })
            .catch(error => {
              console.error('❌ Token verification failed:', error.response?.status);
              if (error.response?.status === 401) {
                // Only clear if unauthorized
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
              }
            });
        } else {
          console.log('ℹ️ No saved credentials');
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        // CRITICAL: Always set loading to false
        console.log('✅ Auth loading complete');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔑 Attempting login for:', email);
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      const normalizedUser = normalizeUser(user);
      
      console.log('✅ Login successful:', normalizedUser._id);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      
      return { ...response.data, user: normalizedUser };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      console.log('📝 Attempting registration');
      const response = await API.post('/auth/register', data);
      
      if (response.data.token) {
        const { token, user } = response.data;
        const normalizedUser = normalizeUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }
      
      console.log('✅ Registration successful');
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    console.log('🔄 Updating user');
    const normalizedUser = normalizeUser(updatedUser);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user
  };

  console.log('📊 AuthContext state:', { 
    loading, 
    isAuthenticated: !!user, 
    userId: user?._id,
    userRole: user?.role 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
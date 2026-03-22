// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await login(formData.email, formData.password);
      
//       // Navigate based on role
//       const roleRoutes = {
//         student: '/student/dashboard',
//         expert: '/expert/dashboard',
//         lecturer: '/lecturer/dashboard',
//         admin: '/admin/dashboard',
//       };
      
//       navigate(roleRoutes[response.user.role] || '/student/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Left Side - Branding */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
//         <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
//         <div className="relative z-10">
//           <div className="flex items-center gap-3 text-white mb-12">
//             <div className="bg-white p-3 rounded-xl">
//               <GraduationCap className="w-8 h-8 text-primary-600" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">University Academic Portal</h1>
//             </div>
//           </div>
//         </div>

//         <div className="relative z-10">
//           <h2 className="text-4xl font-bold text-white mb-6">
//             Empowering Minds,<br />Shaping the Future.
//           </h2>
          
//           <div className="space-y-4 text-white/90">
//             <div className="flex items-center gap-3">
//               <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
//                 <div className="w-3 h-3 rounded-full bg-white"></div>
//               </div>
//               <span>Dedicated portals for students and faculty</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
//                 <div className="w-3 h-3 rounded-full bg-white"></div>
//               </div>
//               <span>Real-time academic performance tracking</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
//                 <div className="w-3 h-3 rounded-full bg-white"></div>
//               </div>
//               <span>Research collaboration and resources</span>
//             </div>
//           </div>

//           <div className="mt-8 flex items-center gap-2">
//             <div className="flex -space-x-2">
//               <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"></div>
//               <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"></div>
//               <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"></div>
//             </div>
//             <span className="text-white/80 text-sm">Join over 2,000 active students and educators this semester.</span>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           <div className="lg:hidden mb-8 text-center">
//             <div className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg mb-4">
//               <GraduationCap className="w-6 h-6" />
//               <span className="font-bold">University Portal</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back peers</h2>
//             <p className="text-gray-600 mb-8">Please enter your credentials to access your dashboard.</p>

//             {error && (
//               <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
//                 <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <p className="text-red-800 font-medium">Invalid email or password</p>
//                   <p className="text-red-600 text-sm">{error}</p>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({...formData, email: e.target.value})}
//                     className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                     placeholder="e.g. name@university.edu"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="block text-sm font-medium text-gray-700">Password</label>
//                   <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
//                     Forgot Password?
//                   </Link>
//                 </div>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={formData.password}
//                     onChange={(e) => setFormData({...formData, password: e.target.value})}
//                     className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
//                     placeholder="••••••••"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="remember"
//                   className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
//                 />
//                 <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
//                   Remember me for 30 days
//                 </label>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Logging in...
//                   </>
//                 ) : (
//                   'Login to Portal'
//                 )}
//               </button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-gray-600 text-sm">
//                 NEW TO THE PORTAL?{' '}
//                 <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
//                   Register for Access
//                 </Link>
//               </p>
//             </div>

//             <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
//               © 2024 University Academic Services. All rights reserved.
//               <div className="mt-1">
//                 <a href="#" className="hover:text-primary-600">Privacy Policy</a>
//                 <span className="mx-2">·</span>
//                 <a href="#" className="hover:text-primary-600">Terms of Service</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      
      // Check status
      if (response.user.status === 'pending') {
        setError('Your account is pending admin approval. You will be emailed once approved.');
        setLoading(false);
        return;
      }

      if (response.user.status === 'rejected') {
        setError('Your application was rejected. Please contact admin for details.');
        setLoading(false);
        return;
      }

      if (response.user.status === 'inactive') {
        setError('Your account has been deactivated. Please contact admin.');
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${response.user.fullName}!`);
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-12">
            <div className="bg-white p-3 rounded-xl">
              <GraduationCap className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">University Academic Portal</h1>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Empowering Minds,<br />Shaping the Future.
          </h2>
          
          <div className="space-y-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <span>Dedicated portals for students and faculty</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <span>Real-time academic performance tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
              <span>Research collaboration and resources</span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"></div>
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white"></div>
            </div>
            <span className="text-white/80 text-sm">Join over 2,000 active students and educators this semester.</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg mb-4">
              <GraduationCap className="w-6 h-6" />
              <span className="font-bold">University Portal</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Please enter your credentials to access your dashboard.</p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Login Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. name@university.edu"
                required
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
              >
                {loading ? 'Logging in...' : 'Login to Portal'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                NEW TO THE PORTAL?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Register for Access
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
              © 2024 University Academic Services. All rights reserved.
              <div className="mt-1">
                <a href="#" className="hover:text-primary-600">Privacy Policy</a>
                <span className="mx-2">·</span>
                <a href="#" className="hover:text-primary-600">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

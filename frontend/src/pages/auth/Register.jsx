// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { GraduationCap } from 'lucide-react';

// const Register = () => {
//   const { register } = useAuth();
//   const [step, setStep] = useState(1);
//   const [role, setRole] = useState('student');
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     studentId: '',
//     password: '',
//     yearLevel: 3,
//     semester: 1,
//     specialization: 'IT',
//     period: 'Jan-May',
//     academicYear: 2025
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await register({ ...formData, role });
//       // Navigate based on role
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-center text-white">
//         <div className="bg-white/10 p-3 rounded-xl inline-flex items-center gap-2 w-fit mb-8">
//           <GraduationCap className="w-8 h-8" />
//           <span className="font-bold text-xl">AcademiaHub</span>
//         </div>
//         <h1 className="text-5xl font-bold mb-6">Empowering your<br/>academic journey.</h1>
//         <p className="text-lg text-white/80">Join a global community of students, expert tutors, and lecturers.</p>
//       </div>

//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
//           <div className="mb-6">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-sm font-medium text-primary-600">STEP {step} OF 3</span>
//               <span className="text-sm text-gray-500">33% Complete</span>
//             </div>
//             <div className="h-2 bg-gray-200 rounded-full">
//               <div className="h-full bg-primary-500 rounded-full transition-all" style={{width: '33%'}}></div>
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
//           <p className="text-gray-600 mb-6">Fill in your information to get started.</p>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium mb-2">Select Your Role</label>
//               <div className="grid grid-cols-3 gap-3">
//                 {['student', 'expert', 'lecturer'].map((r) => (
//                   <button
//                     key={r}
//                     type="button"
//                     onClick={() => setRole(r)}
//                     className={`p-4 rounded-lg border-2 text-center capitalize ${role === r ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
//                   >
//                     {r}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Full Name</label>
//               <input
//                 type="text"
//                 value={formData.fullName}
//                 onChange={(e) => setFormData({...formData, fullName: e.target.value})}
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                 placeholder="e.g. John Doe"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">University Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                   placeholder="name@uni.edu"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">Student ID</label>
//                 <input
//                   type="text"
//                   value={formData.studentId}
//                   onChange={(e) => setFormData({...formData, studentId: e.target.value})}
//                   className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                   placeholder="8-10 digits"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-2">Password</label>
//               <input
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({...formData, password: e.target.value})}
//                 className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                 placeholder="Min. 8 characters"
//                 required
//                 minLength={8}
//               />
//             </div>

//             <button type="submit" className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
//               Continue to Step 2 →
//             </button>

//             <p className="text-center text-sm text-gray-600">
//               Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Log in</Link>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;



import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { SPECIALIZATIONS, YEAR_LEVELS, SEMESTERS, PERIODS } from '../../utils/constants';
import toast from 'react-hot-toast';

// Module data organized by specialization and year
const MODULES_DATA = {
  // Common modules for Year 1 (all specializations)
  1: {
    1: [ // Semester 1
      { code: 'IT1120', name: 'Introduction to Programming', credits: 4 },
      { code: 'IE1030', name: 'Data Communication Networks', credits: 4 },
      { code: 'IT1130', name: 'Mathematics for Computing', credits: 4 },
      { code: 'IT1140', name: 'Fundamentals of Computing', credits: 4 },
    ],
    2: [ // Semester 2
      { code: 'IT1160', name: 'Discrete Mathematics', credits: 4 },
      { code: 'IT1170', name: 'Data Structures and Algorithms', credits: 4 },
      { code: 'SE1010', name: 'Software Engineering', credits: 4 },
      { code: 'IT1150', name: 'Technical Writing', credits: 4 },
    ]
  },
  
  // Common modules for Year 2 (all specializations)
  2: {
    1: [ // Semester 1
      { code: 'IT2120', name: 'Probability and Statistics', credits: 4 },
      { code: 'SE2010', name: 'Object Oriented Programming', credits: 4 },
      { code: 'IT2130', name: 'Operating Systems & System Administration', credits: 4 },
      { code: 'IT2140', name: 'Database Design and Development', credits: 4 },
    ],
    2: [ // Semester 2
      { code: 'IT2011', name: 'Artificial Intelligence & Machine Learning', credits: 4 },
      { code: 'IT2150', name: 'IT Project', credits: 4 },
      { code: 'SE2020', name: 'Web and Mobile Technologies', credits: 4 },
      { code: 'IT2160', name: 'Professional Skills', credits: 4 },
    ]
  },

  // IT Specialization - Year 3
  IT: {
    3: {
      1: [
        { code: 'IT3120', name: 'Industry Economics & Management', credits: 4 },
        { code: 'IT3130', name: 'Application Development', credits: 4 },
        { code: 'IT3140', name: 'Database Systems', credits: 4 },
        { code: 'IT3150', name: 'IT Process and Infrastructure Management', credits: 4 },
      ],
      2: [
        { code: 'IT3190', name: 'Industry Training', credits: 0 },
        { code: 'IT3180', name: 'Cloud Technologies', credits: 4 },
        { code: 'IT3200', name: 'Data Analytics', credits: 4 },
        { code: 'IT3160', name: 'Research Methods', credits: 4 },
      ]
    },
    4: {
      1: [
        { code: 'IT4200', name: 'Research Project - I', credits: 4 },
        { code: 'IT4210', name: 'Information Security', credits: 4 },
        { code: 'IT4150', name: 'Intelligent Systems Development', credits: 4 },
        { code: 'IT4180', name: 'IT Policy Management and Governance', credits: 4 },
        { code: 'IT4160', name: 'Software Quality Management', credits: 4 },
      ],
      2: [
        { code: 'IT4200', name: 'Research Project - II', credits: 8 },
        { code: 'IT4190', name: 'Current Trends in IT', credits: 4 },
        { code: 'SE4120', name: 'Enterprise Application Development', credits: 4 },
        { code: 'IT4170', name: 'Human Computer Interaction', credits: 4 },
      ]
    }
  },

  // SE Specialization - Year 3 & 4
  SE: {
    3: {
      1: [
        { code: 'IT3120', name: 'Industry Economics & Management', credits: 4 },
        { code: 'SE3090', name: 'Software Engineering Frameworks', credits: 4 },
        { code: 'SE3100', name: 'Architecture based Development', credits: 4 },
        { code: 'SE3110', name: 'Quality Management in Software Engineering', credits: 4 },
      ],
      2: [
        { code: 'IT3190', name: 'Industry Training', credits: 4 },
        { code: 'SE3120', name: 'Distributed Systems', credits: 4 },
        { code: 'SE3130', name: 'User Experience Research & Design', credits: 4 },
        { code: 'IT3160', name: 'Research Methods', credits: 4 },
      ]
    },
    4: {
      1: [
        { code: 'IT4200', name: 'Research Project - I', credits: 6 },
        { code: 'SE4070', name: 'Secure Software Development', credits: 4 },
        { code: 'SE4080', name: 'Cloud Native Development', credits: 4 },
        { code: 'SE4100', name: 'Deep Learning', credits: 4 },
        { code: 'SE4090', name: 'Mobile Application Design & Development', credits: 4 },
      ],
      2: [
        { code: 'IT4200', name: 'Research Project - II', credits: 6 },
        { code: 'SE4110', name: 'Current Trends in Software Engineering', credits: 4 },
        { code: 'SE4120', name: 'Enterprise Application Development', credits: 4 },
        { code: 'SE4140', name: 'Big Data & Data Analytics', credits: 4 },
        { code: 'SE4130', name: 'Parallel Computing', credits: 4 },
      ]
    }
  },

  // CSNE Specialization - Year 3 & 4
  CSNE: {
    3: {
      1: [
        { code: 'IT3120', name: 'Industry Economics & Management', credits: 4 },
        { code: 'IE3090', name: 'Network Programming', credits: 4 },
        { code: 'IE3100', name: 'Virtualization and Cloud Computing Technologies', credits: 4 },
        { code: 'IE3110', name: 'Advanced Network Engineering', credits: 4 },
      ],
      2: [
        { code: 'IT3190', name: 'Industry Training', credits: 0 },
        { code: 'IE3120', name: 'Capstone Project', credits: 4 },
        { code: 'IE3130', name: 'Enterprise Network and Systems Security', credits: 4 },
        { code: 'IT3160', name: 'Research Methods', credits: 4 },
      ]
    },
    4: {
      1: [
        { code: 'IT4200', name: 'Research Project - I', credits: 4 },
        { code: 'IE4090', name: 'DevOps', credits: 4 },
        { code: 'IE4100', name: 'Network Storage and Architecture', credits: 4 },
        { code: 'IE4112', name: 'Data & Systems Security', credits: 4 },
        { code: 'IE4102', name: 'Governance, Risk Management & Compliance', credits: 4 },
      ],
      2: [
        { code: 'IT4200', name: 'Research Project - II', credits: 8 },
        { code: 'IE4110', name: 'Software Defined Networks', credits: 4 },
        { code: 'IE4120', name: 'Robotics and Intelligent Systems', credits: 4 },
        { code: 'IE4130', name: 'Internet of Things', credits: 4 },
      ]
    }
  },

  // DS Specialization - Year 3 & 4
  DS: {
    3: {
      1: [
        { code: 'IT3120', name: 'Industry Economics & Management', credits: 4 },
        { code: 'IT3081', name: 'Statistical Modelling', credits: 4 },
        { code: 'IT3091', name: 'Machine Learning', credits: 4 },
        { code: 'IT3101', name: 'Data Warehousing and Business Intelligence', credits: 4 },
      ],
      2: [
        { code: 'IT3190', name: 'Industry Training', credits: 4 },
        { code: 'IT3111', name: 'Deep Learning', credits: 4 },
        { code: 'IT3121', name: 'Cloud Data Analytics', credits: 4 },
        { code: 'IT3160', name: 'Research Methods', credits: 4 },
      ]
    },
    4: {
      1: [
        { code: 'IT4200', name: 'Research Project - I', credits: 4 },
        { code: 'IT4051', name: 'Modern Topics in Data Science', credits: 4 },
        { code: 'IT4061', name: 'Natural Language Processing', credits: 4 },
        { code: 'IT4081', name: 'Software Engineering Concepts', credits: 4 },
        { code: 'IT4091', name: 'Optimization Methods', credits: 4 },
      ],
      2: [
        { code: 'IT4200', name: 'Research Project - II', credits: 8 },
        { code: 'IT4071', name: 'Data Governance, Privacy and Security', credits: 4 },
        { code: 'IT4101', name: 'Database Implementation and Administration', credits: 4 },
        { code: 'IT4111', name: 'MLOps for Data Analytics', credits: 4 },
      ]
    }
  }
};

// Get modules based on year, semester, and specialization
const getModulesForSelection = (yearLevel, specialization) => {
  const modules = [];

  if (yearLevel <= 2) {
    // Year 1 & 2: Common for all specializations
    const yearModules = MODULES_DATA[yearLevel];
    if (yearModules) {
      // Get both semester 1 and semester 2 modules
      const sem1 = yearModules[1] || [];
      const sem2 = yearModules[2] || [];
      modules.push(...sem1, ...sem2);
    }
  } else {
    // Year 3 & 4: Specialization-specific
    const specModules = MODULES_DATA[specialization];
    if (specModules && specModules[yearLevel]) {
      const sem1 = specModules[yearLevel][1] || [];
      const sem2 = specModules[yearLevel][2] || [];
      modules.push(...sem1, ...sem2);
    }
  }

  return modules;
};

// Get ALL modules for lecturer
const getAllModules = () => {
  const allModules = [];
  
  // Year 1 & 2 common modules
  [1, 2].forEach(year => {
    const yearData = MODULES_DATA[year];
    if (yearData) {
      [1, 2].forEach(sem => {
        if (yearData[sem]) {
          allModules.push(...yearData[sem]);
        }
      });
    }
  });

  // All specialization modules (Year 3 & 4)
  ['IT', 'SE', 'CSNE', 'DS'].forEach(spec => {
    const specData = MODULES_DATA[spec];
    if (specData) {
      [3, 4].forEach(year => {
        if (specData[year]) {
          [1, 2].forEach(sem => {
            if (specData[year][sem]) {
              allModules.push(...specData[year][sem]);
            }
          });
        }
      });
    }
  });

  // Remove duplicates based on module code
  const uniqueModules = allModules.filter((module, index, self) =>
    index === self.findIndex(m => m.code === module.code)
  );

  return uniqueModules;
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 - Common fields
    fullName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    role: 'student',

    // Step 2 - Academic Info
    yearLevel: 3,
    semester: 1,
    academicYear: 2025,
    period: 'Jan-May',
    specialization: 'IT',
    batch: '',
    enrolledModules: [], // NEW: Selected modules

    // Expert-specific fields
    gpa: '',
    masteredModules: [],
    expertiseModules: [],
    tutoringExperience: 'None',
    transcript: null,

    // Lecturer-specific fields
    department: '',
    position: '',
    teachingModules: [], // NEW: Selected teaching modules
  });

  const [errors, setErrors] = useState({});
  const [availableModules, setAvailableModules] = useState([]);

  // Update available modules when year/specialization changes
  useEffect(() => {
    if (formData.role === 'student' || formData.role === 'expert') {
      const modules = getModulesForSelection(formData.yearLevel, formData.specialization);
      setAvailableModules(modules);
    } else if (formData.role === 'lecturer') {
      const modules = getAllModules();
      setAvailableModules(modules);
    }
  }, [formData.yearLevel, formData.specialization, formData.role]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    let newValue = value;
    
    // Convert to number for numeric fields
    if (name === 'yearLevel' || name === 'semester' || name === 'academicYear') {
      newValue = parseInt(value);
    }
    
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : newValue
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleModuleSelection = (moduleCode) => {
    const field = formData.role === 'lecturer' ? 'teachingModules' : 'enrolledModules';
    
    setFormData(prev => {
      const currentModules = prev[field] || [];
      const isSelected = currentModules.includes(moduleCode);
      
      return {
        ...prev,
        [field]: isSelected
          ? currentModules.filter(code => code !== moduleCode)
          : [...currentModules, moduleCode]
      };
    });
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student/Lecturer ID is required';
    } else if (formData.studentId.length < 8) {
      newErrors.studentId = 'ID must be at least 8 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Student validation
    if (formData.role === 'student') {
      if (!formData.enrolledModules || formData.enrolledModules.length === 0) {
        newErrors.enrolledModules = 'Please select at least one module';
      }
    }

    // Expert validation
    if (formData.role === 'expert') {
      const gpa = parseFloat(formData.gpa);
      if (!formData.gpa) {
        newErrors.gpa = 'GPA is required';
      } else if (isNaN(gpa) || gpa < 3.5 || gpa > 4.0) {
        newErrors.gpa = 'GPA must be between 3.5 and 4.0';
      }

      if (!formData.transcript) {
        newErrors.transcript = 'Official transcript is required';
      }

      if (!formData.enrolledModules || formData.enrolledModules.length === 0) {
        newErrors.enrolledModules = 'Please select at least one module';
      }
    }

    // Lecturer validation
    if (formData.role === 'lecturer') {
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
      if (!formData.position) {
        newErrors.position = 'Position is required';
      }
      if (!formData.teachingModules || formData.teachingModules.length === 0) {
        newErrors.teachingModules = 'Please select at least one teaching module';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 2 && !validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add academic info for students and experts
      if (formData.role === 'student' || formData.role === 'expert') {
        submitData.studentId = formData.studentId;
        submitData.yearLevel = formData.yearLevel;
        submitData.semester = formData.semester;
        submitData.academicYear = formData.academicYear;
        submitData.period = formData.period;
        submitData.specialization = formData.specialization;
        submitData.batch = `${formData.specialization}-${formData.yearLevel}-${formData.academicYear}`;
        submitData.enrolledModules = formData.enrolledModules;
      }

      // Add expert-specific fields
      if (formData.role === 'expert') {
        submitData.gpa = parseFloat(formData.gpa);
        submitData.masteredModules = formData.masteredModules;
        submitData.expertiseModules = formData.expertiseModules;
        submitData.tutoringExperience = formData.tutoringExperience;
      }

      // Add lecturer-specific fields
      if (formData.role === 'lecturer') {
        submitData.lecturerId = formData.studentId;
        submitData.department = formData.department;
        submitData.position = formData.position;
        submitData.teachingModules = formData.teachingModules;
      }

      const response = await register(submitData);

      if (formData.role === 'student') {
        toast.success('Registration successful! Welcome!');
        navigate('/student/dashboard');
      } else {
        toast.success('Application submitted! You will be notified once approved.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    return (step / 2) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-center">
        <div className="bg-white/10 p-3 rounded-xl inline-flex items-center gap-2 w-fit mb-8">
          <GraduationCap className="w-8 h-8 text-white" />
          <span className="font-bold text-xl text-white">AcademiaHub</span>
        </div>

        <h1 className="text-5xl font-bold text-white mb-6">
          Empowering your<br />academic journey.
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Join a global community of students, expert tutors, and lecturers to excel in your studies and share your knowledge.
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20"></div>
            <div>
              <p className="text-white font-semibold">Sarah Jenkins</p>
              <p className="text-white/70 text-sm">Medical Student, Year 3</p>
            </div>
          </div>
          <p className="text-white/90 italic">
            "The resources and peer support here have been instrumental in my clinical rotations. Truly a game changer."
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-primary-600">
                  STEP {step} OF 2
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(getProgress())}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
            <p className="text-gray-600 mb-6">
              {step === 1 && 'Fill in your basic information to get started.'}
              {step === 2 && formData.role === 'student' && 'Select your academic details and modules.'}
              {step === 2 && formData.role === 'expert' && 'Tell us about your expertise and select modules.'}
              {step === 2 && formData.role === 'lecturer' && 'Select your department and teaching modules.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* STEP 1 - Common Fields */}
              {step === 1 && (
                <>
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Role <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'student', label: 'Student' },
                        { value: 'expert', label: 'Expert Student' },
                        { value: 'lecturer', label: 'Lecturer' }
                      ].map((roleOption) => (
                        <button
                          key={roleOption.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: roleOption.value })}
                          className={`p-4 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                            formData.role === roleOption.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {roleOption.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Full Name"
                    name="fullName"
                    icon={User}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    error={errors.fullName}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="University Email"
                      type="email"
                      name="email"
                      icon={Mail}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@uni.edu"
                      error={errors.email}
                      required
                    />

                    <Input
                      label={formData.role === 'lecturer' ? 'Lecturer ID' : 'Student ID'}
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="8-10 digits"
                      error={errors.studentId}
                      required
                    />
                  </div>

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    error={errors.password}
                    helperText="Min. 8 characters with at least one number"
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    error={errors.confirmPassword}
                    required
                  />

                  <Button
                    type="button"
                    onClick={handleNext}
                    fullWidth
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Continue to Step 2
                  </Button>
                </>
              )}

              {/* STEP 2 - Student/Expert Academic Info + Modules */}
              {step === 2 && (formData.role === 'student' || formData.role === 'expert') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Current Year"
                      name="yearLevel"
                      value={formData.yearLevel}
                      onChange={handleChange}
                      options={YEAR_LEVELS.map(y => ({ value: y, label: `Year ${y}` }))}
                      required
                    />

                    <Select
                      label="Current Semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      options={SEMESTERS.map(s => ({ value: s, label: `Semester ${s}` }))}
                      required
                    />
                  </div>

                  <Select
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
                    helperText={formData.yearLevel <= 2 ? 'Specialization applies from Year 3' : ''}
                    disabled={formData.yearLevel <= 2}
                    required
                  />

                  {/* Expert-specific fields */}
                  {formData.role === 'expert' && (
                    <>
                      <Input
                        label="GPA"
                        type="number"
                        step="0.01"
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleChange}
                        placeholder="e.g. 3.75"
                        error={errors.gpa}
                        helperText="Must be 3.5 or above"
                        required
                      />

                      <Select
                        label="Tutoring Experience"
                        name="tutoringExperience"
                        value={formData.tutoringExperience}
                        onChange={handleChange}
                        options={[
                          { value: 'None', label: 'None' },
                          { value: 'Basic', label: 'Basic (< 10 sessions)' },
                          { value: 'Gold', label: 'Gold (10+ sessions)' }
                        ]}
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Official Transcript <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          name="transcript"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          required
                        />
                        {errors.transcript && (
                          <p className="mt-1.5 text-sm text-red-600">{errors.transcript}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">PDF or image format</p>
                      </div>
                    </>
                  )}

                  {/* Module Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your Enrolled Modules <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Year {formData.yearLevel} - Both Semester 1 & 2 modules shown
                    </p>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                      {availableModules.map((module) => (
                        <label
                          key={module.code}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.enrolledModules.includes(module.code)}
                            onChange={() => handleModuleSelection(module.code)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {module.code} - {module.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {module.credits} Credits
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.enrolledModules && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.enrolledModules}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {formData.enrolledModules.length} module(s)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      icon={ArrowLeft}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                    >
                      {loading ? 'Submitting...' : 'Complete Registration'}
                    </Button>
                  </div>
                </>
              )}

              {/* STEP 2 - Lecturer Info + Teaching Modules */}
              {step === 2 && formData.role === 'lecturer' && (
                <>
                  <Select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    options={[...SPECIALIZATIONS, 'Other'].map(d => ({ value: d, label: d }))}
                    error={errors.department}
                    required
                  />

                  <Select
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    options={[
                      { value: 'Lecturer', label: 'Lecturer' },
                      { value: 'Senior Lecturer', label: 'Senior Lecturer' },
                      { value: 'Professor', label: 'Professor' }
                    ]}
                    error={errors.position}
                    required
                  />

                  {/* Teaching Modules Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Teaching Modules <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      All modules from all years and specializations
                    </p>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto space-y-2">
                      {availableModules.map((module) => (
                        <label
                          key={module.code}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.teachingModules.includes(module.code)}
                            onChange={() => handleModuleSelection(module.code)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {module.code} - {module.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {module.credits} Credits
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.teachingModules && (
                      <p className="mt-1.5 text-sm text-red-600">{errors.teachingModules}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {formData.teachingModules.length} module(s)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      icon={ArrowLeft}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                    >
                      {loading ? 'Submitting...' : 'Complete Registration'}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Log in
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
              © 2024 ACADEMIAHUB UNIVERSITY PORTAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
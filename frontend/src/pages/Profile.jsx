import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, BookOpen, Fingerprint, Calendar, Award, Edit2, X, Save } from 'lucide-react';
import { SPECIALIZATIONS, YEAR_LEVELS, SEMESTERS } from '../utils/constants';

// Module data organized by specialization and year
const MODULES_DATA = {
  1: {
    1: [
      { code: 'IT1120', name: 'Introduction to Programming', credits: 4 },
      { code: 'IE1030', name: 'Data Communication Networks', credits: 4 },
      { code: 'IT1130', name: 'Mathematics for Computing', credits: 4 },
      { code: 'IT1140', name: 'Fundamentals of Computing', credits: 4 },
    ],
    2: [
      { code: 'IT1160', name: 'Discrete Mathematics', credits: 4 },
      { code: 'IT1170', name: 'Data Structures and Algorithms', credits: 4 },
      { code: 'SE1010', name: 'Software Engineering', credits: 4 },
      { code: 'IT1150', name: 'Technical Writing', credits: 4 },
    ]
  },
  2: {
    1: [
      { code: 'IT2120', name: 'Probability and Statistics', credits: 4 },
      { code: 'SE2010', name: 'Object Oriented Programming', credits: 4 },
      { code: 'IT2130', name: 'Operating Systems & System Administration', credits: 4 },
      { code: 'IT2140', name: 'Database Design and Development', credits: 4 },
    ],
    2: [
      { code: 'IT2011', name: 'Artificial Intelligence & Machine Learning', credits: 4 },
      { code: 'IT2150', name: 'IT Project', credits: 4 },
      { code: 'SE2020', name: 'Web and Mobile Technologies', credits: 4 },
      { code: 'IT2160', name: 'Professional Skills', credits: 4 },
    ]
  },
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

const getModulesForSelection = (yearLevel, specialization) => {
  const modules = [];

  if (yearLevel <= 2) {
    const yearModules = MODULES_DATA[yearLevel];
    if (yearModules) {
      const sem1 = yearModules[1] || [];
      const sem2 = yearModules[2] || [];
      modules.push(...sem1, ...sem2);
    }
  } else {
    const specModules = MODULES_DATA[specialization] || MODULES_DATA['IT'];
    if (specModules && specModules[yearLevel]) {
      const sem1 = specModules[yearLevel][1] || [];
      const sem2 = specModules[yearLevel][2] || [];
      modules.push(...sem1, ...sem2);
    }
  }

  return modules;
};

// Helper to find the module name given just the code across all modules
const getModuleNameByCode = (code) => {
  let foundName = code;
  // Year 1 & 2
  [1, 2].forEach(year => {
    if (MODULES_DATA[year]) {
      [1, 2].forEach(sem => {
        if (MODULES_DATA[year][sem]) {
          const mod = MODULES_DATA[year][sem].find(m => m.code === code);
          if (mod) foundName = mod.name;
        }
      });
    }
  });
  // Year 3 & 4
  ['IT', 'SE', 'CSNE', 'DS'].forEach(spec => {
    if (MODULES_DATA[spec]) {
      [3, 4].forEach(year => {
        if (MODULES_DATA[spec][year]) {
          [1, 2].forEach(sem => {
            if (MODULES_DATA[spec][year][sem]) {
              const mod = MODULES_DATA[spec][year][sem].find(m => m.code === code);
              if (mod) foundName = mod.name;
            }
          });
        }
      });
    }
  });
  return foundName;
};

const StudentProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [availableModules, setAvailableModules] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    yearLevel: 3,
    semester: 1,
    specialization: 'IT',
    enrolledModules: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        studentId: user.studentId || '',
        yearLevel: user.yearLevel || 3,
        semester: user.semester || 1,
        specialization: user.specialization || 'IT',
        enrolledModules: user.enrolledModules || []
      });
    }
  }, [user]);

  // Update available modules whenever year or specialization changes AND we are in edit mode
  useEffect(() => {
    if (isEditing) {
      const modules = getModulesForSelection(formData.yearLevel, formData.specialization);
      setAvailableModules(modules);
    }
  }, [formData.yearLevel, formData.specialization, isEditing]);

  const handleChange = (e) => {
    if (!isEditing) return;
    const { name, value, type } = e.target;
    let finalValue = value;
    
    if (name === 'yearLevel' || name === 'semester') {
      finalValue = parseInt(value, 10);
    }

    setFormData({
      ...formData,
      [name]: finalValue
    });
  };

  const handleModuleSelection = (moduleCode) => {
    if (!isEditing) return;
    setFormData(prev => {
      const current = prev.enrolledModules || [];
      if (current.includes(moduleCode)) {
        return { ...prev, enrolledModules: current.filter(c => c !== moduleCode) };
      }
      return { ...prev, enrolledModules: [...current, moduleCode] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = user._id || user.id;
      await API.put(`/users/${userId}`, {
        yearLevel: formData.yearLevel,
        semester: formData.semester,
        specialization: formData.specialization,
        enrolledModules: formData.enrolledModules
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      
      const res = await API.get('/auth/me');
      if (res.data.success && res.data.user) {
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <span className="text-4xl md:text-5xl font-bold text-primary-700">
                {user.fullName?.charAt(0)}
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mt-2 md:mt-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.fullName || `${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'} Profile`}</h1>
              <p className="text-gray-600 font-medium text-base mt-1">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'} Profile</p>
              <p className="text-gray-500 text-sm mt-1">Manage your identity and context.</p>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} icon={Edit2} className="w-full md:w-auto shadow-sm">
                  Edit Details
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(false)} icon={X} className="w-full md:w-auto shadow-sm">
                  Cancel Editing
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Identity Information Sector - Read Only */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> Personal Identity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  icon={User}
                  value={formData.fullName}
                  disabled
                  helperText="Name cannot be changed."
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  disabled
                  helperText="Email cannot be changed."
                />
                <Input
                  label="Student ID"
                  name="studentId"
                  icon={Fingerprint}
                  value={formData.studentId}
                  disabled
                  helperText="ID cannot be changed."
                />
              </div>
            </div>

            {/* Academic Information Sector - Editable */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-500" /> Academic Context
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isEditing ? (
                   <Select
                    label="Year Level"
                    name="yearLevel"
                    value={formData.yearLevel}
                    onChange={handleChange}
                    options={YEAR_LEVELS.map(y => ({ value: y, label: `Year ${y}` }))}
                  />
                ) : (
                  <Input
                    label="Year Level"
                    name="yearLevel"
                    icon={Calendar}
                    value={`Year ${formData.yearLevel}`}
                    disabled
                  />
                )}
                
                {isEditing ? (
                   <Select
                    label="Semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    options={SEMESTERS.map(s => ({ value: s, label: `Semester ${s}` }))}
                  />
                ) : (
                  <Input
                    label="Semester"
                    name="semester"
                    icon={BookOpen}
                    value={`Semester ${formData.semester}`}
                    disabled
                  />
                )}

                {/* Specialization only changes year 3 and 4, and perhaps we don't want them editing spec once chosen, but let's allow it if editing year */}
                {isEditing ? (
                   <Select
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    disabled={formData.yearLevel <= 2}
                    options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
                  />
                ) : (
                  <Input
                    label="Specialization"
                    name="specialization"
                    icon={Award}
                    value={formData.specialization === 'None' && formData.yearLevel <= 2 ? 'General' : formData.specialization}
                    disabled
                  />
                )}
              </div>
            </div>

            {/* Enrolled Modules Sector */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" /> Enrolled Modules
              </h2>
              
              {!isEditing ? (
                // Read Only View - Display as beautiful tags
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  {formData.enrolledModules.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No modules currently enrolled.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {formData.enrolledModules.map(code => (
                        <div key={code} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                          <Badge variant="primary">{code}</Badge>
                          <span className="font-medium text-gray-800 text-sm">
                            {getModuleNameByCode(code)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Edit View - Selectable Checkbox List
                <div className="border border-primary-200 rounded-lg p-4 bg-primary-50/30 max-h-64 overflow-y-auto space-y-2">
                  <p className="text-xs text-primary-600 font-medium mb-3">Select the modules you are currently enrolled in for this semester.</p>
                  {availableModules.length === 0 && (
                    <p className="text-sm text-gray-500 italic p-2">Select your Year and Specialization first.</p>
                  )}
                  {availableModules.map((module) => (
                    <label
                      key={module.code}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-primary-100"
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
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button type="submit" loading={loading} icon={Save}>
                  Save Academic Profile
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;

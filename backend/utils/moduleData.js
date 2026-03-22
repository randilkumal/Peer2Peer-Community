// Complete module data for all specializations
const modulesData = [
  // ============================================
  // YEAR 1 - SEMESTER 1 (All specializations)
  // ============================================
  {
    code: 'IT1120',
    name: 'Introduction to Programming',
    credits: 4,
    yearLevel: 1,
    semester: 1,
    specializations: ['All']
  },
  {
    code: 'IE1030',
    name: 'Data Communication Networks',
    credits: 4,
    yearLevel: 1,
    semester: 1,
    specializations: ['All']
  },
  {
    code: 'IT1130',
    name: 'Mathematics for Computing',
    credits: 4,
    yearLevel: 1,
    semester: 1,
    specializations: ['All']
  },
  {
    code: 'IT1140',
    name: 'Fundamentals of Computing',
    credits: 4,
    yearLevel: 1,
    semester: 1,
    specializations: ['All']
  },
  
  // ============================================
  // YEAR 1 - SEMESTER 2 (All specializations)
  // ============================================
  {
    code: 'IT1160',
    name: 'Discrete Mathematics',
    credits: 4,
    yearLevel: 1,
    semester: 2,
    specializations: ['All']
  },
  {
    code: 'IT1170',
    name: 'Data Structures and Algorithms',
    credits: 4,
    yearLevel: 1,
    semester: 2,
    specializations: ['All']
  },
  {
    code: 'SE1010',
    name: 'Software Engineering',
    credits: 4,
    yearLevel: 1,
    semester: 2,
    specializations: ['All']
  },
  {
    code: 'IT1150',
    name: 'Technical Writing',
    credits: 4,
    yearLevel: 1,
    semester: 2,
    specializations: ['All']
  },
  
  // ============================================
  // YEAR 2 - SEMESTER 1 (All specializations)
  // ============================================
  {
    code: 'IT2120',
    name: 'Probability and Statistics',
    credits: 4,
    yearLevel: 2,
    semester: 1,
    specializations: ['All']
  },
  {
    code: 'SE2010',
    name: 'Object Oriented Programming',
    credits: 4,
    yearLevel: 2,
    semester: 1,
    specializations: ['All']
  },
  {
    code: 'IT2130',
    name: 'Operating Systems & System Administration',
    credits: 4,
    yearLevel: 2,
    semester: 1,
    specializations: ['All']
  },
  {
    code: 'IT2140',
    name: 'Database Design and Development',
    credits: 4,
    yearLevel: 2,
    semester: 1,
    specializations: ['All']
  },
  
  // ============================================
  // YEAR 2 - SEMESTER 2 (All specializations)
  // ============================================
  {
    code: 'IT2011',
    name: 'Artificial Intelligence & Machine Learning',
    credits: 4,
    yearLevel: 2,
    semester: 2,
    specializations: ['All']
  },
  {
    code: 'IT2150',
    name: 'IT Project',
    credits: 4,
    yearLevel: 2,
    semester: 2,
    specializations: ['All']
  },
  {
    code: 'SE2020',
    name: 'Web and Mobile Technologies',
    credits: 4,
    yearLevel: 2,
    semester: 2,
    specializations: ['All']
  },
  {
    code: 'IT2160',
    name: 'Professional Skills',
    credits: 4,
    yearLevel: 2,
    semester: 2,
    specializations: ['All']
  },
  
  // ============================================
  // YEAR 3 - IT SPECIALIZATION
  // ============================================
  // Semester 1
  {
    code: 'IT3120',
    name: 'Industry Economics & Management',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['IT']
  },
  {
    code: 'IT3130',
    name: 'Application Development',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['IT']
  },
  {
    code: 'IT3140',
    name: 'Database Systems',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['IT']
  },
  {
    code: 'IT3150',
    name: 'IT Process and Infrastructure Management',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['IT']
  },
  // Semester 2
  {
    code: 'IT3190',
    name: 'Industry Training',
    credits: 0,
    yearLevel: 3,
    semester: 2,
    specializations: ['IT']
  },
  {
    code: 'IT3180',
    name: 'Cloud Technologies',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['IT']
  },
  {
    code: 'IT3200',
    name: 'Data Analytics',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['IT']
  },
  {
    code: 'IT3160',
    name: 'Research Methods',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['IT', 'SE', 'DS', 'CSNE'] // Common for all in Year 3 Sem 2
  },
  
  // ============================================
  // YEAR 3 - SE SPECIALIZATION
  // ============================================
  // Semester 1 (shares IT3120 with IT)
  {
    code: 'SE3090',
    name: 'Software Engineering Frameworks',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['SE']
  },
  {
    code: 'SE3100',
    name: 'Architecture based Development',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['SE']
  },
  {
    code: 'SE3110',
    name: 'Quality Management in Software Engineering',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['SE']
  },
  // Semester 2 (shares IT3190 and IT3160)
  {
    code: 'SE3120',
    name: 'Distributed Systems',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['SE']
  },
  {
    code: 'SE3130',
    name: 'User Experience Research & Design',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['SE']
  },
  
  // ============================================
  // YEAR 3 - DS SPECIALIZATION
  // ============================================
  // Semester 1 (shares IT3120)
  {
    code: 'IT3081',
    name: 'Statistical Modelling',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['DS']
  },
  {
    code: 'IT3091',
    name: 'Machine Learning',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['DS']
  },
  {
    code: 'IT3101',
    name: 'Data Warehousing and Business Intelligence',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['DS']
  },
  // Semester 2 (shares IT3190 and IT3160)
  {
    code: 'IT3111',
    name: 'Deep Learning',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['DS']
  },
  {
    code: 'IT3121',
    name: 'Cloud Data Analytics',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['DS']
  },
  
  // ============================================
  // YEAR 3 - CSNE SPECIALIZATION
  // ============================================
  // Semester 1 (shares IT3120)
  {
    code: 'IE3090',
    name: 'Network Programming',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['CSNE']
  },
  {
    code: 'IE3100',
    name: 'Virtualization and Cloud Computing Technologies',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['CSNE']
  },
  {
    code: 'IE3110',
    name: 'Advanced Network Engineering',
    credits: 4,
    yearLevel: 3,
    semester: 1,
    specializations: ['CSNE']
  },
  // Semester 2 (shares IT3190 and IT3160)
  {
    code: 'IE3120',
    name: 'Capstone Project',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['CSNE']
  },
  {
    code: 'IE3130',
    name: 'Enterprise Network and Systems Security',
    credits: 4,
    yearLevel: 3,
    semester: 2,
    specializations: ['CSNE']
  },
  
  // ============================================
  // YEAR 4 - IT SPECIALIZATION
  // ============================================
  // Semester 1
  {
    code: 'IT4200',
    name: 'Research Project - I',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['IT', 'SE', 'DS', 'CSNE'] // Common for all Year 4
  },
  {
    code: 'IT4210',
    name: 'Information Security',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['IT']
  },
  {
    code: 'IT4150',
    name: 'Intelligent Systems Development',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['IT']
  },
  {
    code: 'IT4180',
    name: 'IT Policy Management and Governance',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['IT']
  },
  {
    code: 'IT4160',
    name: 'Software Quality Management',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['IT']
  },
  // Semester 2
  {
    code: 'IT4201',
    name: 'Research Project - II',
    credits: 8,
    yearLevel: 4,
    semester: 2,
    specializations: ['IT', 'SE', 'DS', 'CSNE'] // Common for all Year 4
  },
  {
    code: 'IT4190',
    name: 'Current Trends in IT',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['IT']
  },
  {
    code: 'SE4120',
    name: 'Enterprise Application Development',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['IT', 'SE'] // Shared between IT and SE
  },
  {
    code: 'IT4170',
    name: 'Human Computer Interaction',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['IT']
  },
  
  // ============================================
  // YEAR 4 - SE SPECIALIZATION
  // ============================================
  // Semester 1 (shares IT4200)
  {
    code: 'SE4070',
    name: 'Secure Software Development',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['SE']
  },
  {
    code: 'SE4080',
    name: 'Cloud Native Development',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['SE']
  },
  {
    code: 'SE4100',
    name: 'Deep Learning',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['SE']
  },
  {
    code: 'SE4090',
    name: 'Mobile Application Design & Development',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['SE']
  },
  // Semester 2 (shares IT4201 and SE4120)
  {
    code: 'SE4110',
    name: 'Current Trends in Software Engineering',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['SE']
  },
  {
    code: 'SE4140',
    name: 'Big Data & Data Analytics',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['SE']
  },
  {
    code: 'SE4130',
    name: 'Parallel Computing',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['SE']
  },
  
  // ============================================
  // YEAR 4 - DS SPECIALIZATION
  // ============================================
  // Semester 1 (shares IT4200)
  {
    code: 'IT4051',
    name: 'Modern Topics in Data Science',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['DS']
  },
  {
    code: 'IT4061',
    name: 'Natural Language Processing',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['DS']
  },
  {
    code: 'IT4081',
    name: 'Software Engineering Concepts',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['DS']
  },
  {
    code: 'IT4091',
    name: 'Optimization Methods',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['DS']
  },
  // Semester 2 (shares IT4201)
  {
    code: 'IT4071',
    name: 'Data Governance, Privacy and Security',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['DS']
  },
  {
    code: 'IT4101',
    name: 'Database Implementation and Administration',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['DS']
  },
  {
    code: 'IT4111',
    name: 'MLOps for Data Analytics',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['DS']
  },
  
  // ============================================
  // YEAR 4 - CSNE SPECIALIZATION
  // ============================================
  // Semester 1 (shares IT4200)
  {
    code: 'IE4090',
    name: 'DevOps',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['CSNE']
  },
  {
    code: 'IE4100',
    name: 'Network Storage and Architecture',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['CSNE']
  },
  {
    code: 'IE4112',
    name: 'Data & Systems Security',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['CSNE']
  },
  {
    code: 'IE4102',
    name: 'Governance, Risk Management & Compliance',
    credits: 4,
    yearLevel: 4,
    semester: 1,
    specializations: ['CSNE']
  },
  // Semester 2 (shares IT4201)
  {
    code: 'IE4110',
    name: 'Software Defined Networks',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['CSNE']
  },
  {
    code: 'IE4120',
    name: 'Robotics and Intelligent Systems',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['CSNE']
  },
  {
    code: 'IE4130',
    name: 'Internet of Things',
    credits: 4,
    yearLevel: 4,
    semester: 2,
    specializations: ['CSNE']
  }
];

module.exports = modulesData;

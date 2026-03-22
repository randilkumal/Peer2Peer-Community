// require('dotenv').config();
// const mongoose = require('mongoose');
// const Module = require('../models/Module');
// const modulesData = require('./moduleData');

// const seedModules = async () => {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ MongoDB Connected');

//     // Clear existing modules
//     await Module.deleteMany({});
//     console.log('🗑️  Cleared existing modules');

//     // Insert all modules
//     await Module.insertMany(modulesData);
//     console.log(`✅ Successfully seeded ${modulesData.length} modules`);

//     // Display summary
//     const summary = {
//       'Year 1 Sem 1': modulesData.filter(m => m.yearLevel === 1 && m.semester === 1).length,
//       'Year 1 Sem 2': modulesData.filter(m => m.yearLevel === 1 && m.semester === 2).length,
//       'Year 2 Sem 1': modulesData.filter(m => m.yearLevel === 2 && m.semester === 1).length,
//       'Year 2 Sem 2': modulesData.filter(m => m.yearLevel === 2 && m.semester === 2).length,
//       'Year 3 IT': modulesData.filter(m => m.yearLevel === 3 && m.specializations.includes('IT')).length,
//       'Year 3 SE': modulesData.filter(m => m.yearLevel === 3 && m.specializations.includes('SE')).length,
//       'Year 3 DS': modulesData.filter(m => m.yearLevel === 3 && m.specializations.includes('DS')).length,
//       'Year 3 CSNE': modulesData.filter(m => m.yearLevel === 3 && m.specializations.includes('CSNE')).length,
//       'Year 4 IT': modulesData.filter(m => m.yearLevel === 4 && m.specializations.includes('IT')).length,
//       'Year 4 SE': modulesData.filter(m => m.yearLevel === 4 && m.specializations.includes('SE')).length,
//       'Year 4 DS': modulesData.filter(m => m.yearLevel === 4 && m.specializations.includes('DS')).length,
//       'Year 4 CSNE': modulesData.filter(m => m.yearLevel === 4 && m.specializations.includes('CSNE')).length,
//     };

//     console.log('\n📊 Module Summary:');
//     Object.entries(summary).forEach(([key, count]) => {
//       console.log(`   ${key}: ${count} modules`);
//     });

//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error seeding modules:', error);
//     process.exit(1);
//   }
// };

// seedModules();


const mongoose = require('mongoose');
const Module = require('../models/Module');
require('dotenv').config({ path: '../.env' });

const MODULES_DATA = [
  // Year 1 - Semester 1 (Common for all)
  { code: 'IT1120', name: 'Introduction to Programming', credits: 4, level: '4', year: 1, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IE1030', name: 'Data Communication Networks', credits: 4, level: '4', year: 1, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT1130', name: 'Mathematics for Computing', credits: 4, level: '4', year: 1, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT1140', name: 'Fundamentals of Computing', credits: 4, level: '4', year: 1, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },

  // Year 1 - Semester 2 (Common for all)
  { code: 'IT1160', name: 'Discrete Mathematics', credits: 4, level: '4', year: 1, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT1170', name: 'Data Structures and Algorithms', credits: 4, level: '4', year: 1, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'SE1010', name: 'Software Engineering', credits: 4, level: '4', year: 1, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT1150', name: 'Technical Writing', credits: 4, level: '4', year: 1, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },

  // Year 2 - Semester 1 (Common for all)
  { code: 'IT2120', name: 'Probability and Statistics', credits: 4, level: '5', year: 2, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'SE2010', name: 'Object Oriented Programming', credits: 4, level: '5', year: 2, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT2130', name: 'Operating Systems & System Administration', credits: 4, level: '5', year: 2, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT2140', name: 'Database Design and Development', credits: 4, level: '5', year: 2, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },

  // Year 2 - Semester 2 (Common for all)
  { code: 'IT2011', name: 'Artificial Intelligence & Machine Learning', credits: 4, level: '5', year: 2, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT2150', name: 'IT Project', credits: 4, level: '5', year: 2, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'SE2020', name: 'Web and Mobile Technologies', credits: 4, level: '5', year: 2, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT2160', name: 'Professional Skills', credits: 4, level: '5', year: 2, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },

  // IT Specialization - Year 3 Semester 1
  { code: 'IT3120', name: 'Industry Economics & Management', credits: 4, level: '6', year: 3, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT3130', name: 'Application Development', credits: 4, level: '6', year: 3, semester: 1, specializations: ['IT'], department: 'Computing' },
  { code: 'IT3140', name: 'Database Systems', credits: 4, level: '6', year: 3, semester: 1, specializations: ['IT'], department: 'Computing' },
  { code: 'IT3150', name: 'IT Process and Infrastructure Management', credits: 4, level: '6', year: 3, semester: 1, specializations: ['IT'], department: 'Computing' },

  // IT Specialization - Year 3 Semester 2
  { code: 'IT3190', name: 'Industry Training', credits: 0, level: '6', year: 3, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT3180', name: 'Cloud Technologies', credits: 4, level: '6', year: 3, semester: 2, specializations: ['IT'], department: 'Computing' },
  { code: 'IT3200', name: 'Data Analytics', credits: 4, level: '6', year: 3, semester: 2, specializations: ['IT'], department: 'Computing' },
  { code: 'IT3160', name: 'Research Methods', credits: 4, level: '6', year: 3, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },

  // IT Specialization - Year 4 Semester 1
  { code: 'IT4200', name: 'Research Project - I', credits: 4, level: '7', year: 4, semester: 1, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT4210', name: 'Information Security', credits: 4, level: '7', year: 4, semester: 1, specializations: ['IT'], department: 'Computing' },
  { code: 'IT4150', name: 'Intelligent Systems Development', credits: 4, level: '7', year: 4, semester: 1, specializations: ['IT'], department: 'Computing' },
  { code: 'IT4180', name: 'IT Policy Management and Governance', credits: 4, level: '7', year: 4, semester: 1, specializations: ['IT'], department: 'Computing' },
  { code: 'IT4160', name: 'Software Quality Management', credits: 4, level: '7', year: 4, semester: 1, specializations: ['IT'], department: 'Computing' },

  // IT Specialization - Year 4 Semester 2
  { code: 'IT4200-II', name: 'Research Project - II', credits: 8, level: '7', year: 4, semester: 2, specializations: ['IT', 'SE', 'DS', 'CSNE'], department: 'Computing' },
  { code: 'IT4190', name: 'Current Trends in IT', credits: 4, level: '7', year: 4, semester: 2, specializations: ['IT'], department: 'Computing' },
  { code: 'SE4120', name: 'Enterprise Application Development', credits: 4, level: '7', year: 4, semester: 2, specializations: ['IT', 'SE'], department: 'Computing' },
  { code: 'IT4170', name: 'Human Computer Interaction', credits: 4, level: '7', year: 4, semester: 2, specializations: ['IT'], department: 'Computing' },

  // SE Specialization - Year 3 Semester 1
  { code: 'SE3090', name: 'Software Engineering Frameworks', credits: 4, level: '6', year: 3, semester: 1, specializations: ['SE'], department: 'Computing' },
  { code: 'SE3100', name: 'Architecture based Development', credits: 4, level: '6', year: 3, semester: 1, specializations: ['SE'], department: 'Computing' },
  { code: 'SE3110', name: 'Quality Management in Software Engineering', credits: 4, level: '6', year: 3, semester: 1, specializations: ['SE'], department: 'Computing' },

  // SE Specialization - Year 3 Semester 2
  { code: 'SE3120', name: 'Distributed Systems', credits: 4, level: '6', year: 3, semester: 2, specializations: ['SE'], department: 'Computing' },
  { code: 'SE3130', name: 'User Experience Research & Design', credits: 4, level: '6', year: 3, semester: 2, specializations: ['SE'], department: 'Computing' },

  // SE Specialization - Year 4 Semester 1
  { code: 'SE4070', name: 'Secure Software Development', credits: 4, level: '7', year: 4, semester: 1, specializations: ['SE'], department: 'Computing' },
  { code: 'SE4080', name: 'Cloud Native Development', credits: 4, level: '7', year: 4, semester: 1, specializations: ['SE'], department: 'Computing' },
  { code: 'SE4100', name: 'Deep Learning', credits: 4, level: '7', year: 4, semester: 1, specializations: ['SE'], department: 'Computing' },
  { code: 'SE4090', name: 'Mobile Application Design & Development', credits: 4, level: '7', year: 4, semester: 1, specializations: ['SE'], department: 'Computing' },

  // SE Specialization - Year 4 Semester 2
  { code: 'SE4110', name: 'Current Trends in Software Engineering', credits: 4, level: '7', year: 4, semester: 2, specializations: ['SE'], department: 'Computing' },
  { code: 'SE4140', name: 'Big Data & Data Analytics', credits: 4, level: '7', year: 4, semester: 2, specializations: ['SE'], department: 'Computing' },
  { code: 'SE4130', name: 'Parallel Computing', credits: 4, level: '7', year: 4, semester: 2, specializations: ['SE'], department: 'Computing' },

  // CSNE Specialization - Year 3 Semester 1
  { code: 'IE3090', name: 'Network Programming', credits: 4, level: '6', year: 3, semester: 1, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE3100', name: 'Virtualization and Cloud Computing Technologies', credits: 4, level: '6', year: 3, semester: 1, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE3110', name: 'Advanced Network Engineering', credits: 4, level: '6', year: 3, semester: 1, specializations: ['CSNE'], department: 'Computing' },

  // CSNE Specialization - Year 3 Semester 2
  { code: 'IE3120', name: 'Capstone Project', credits: 4, level: '6', year: 3, semester: 2, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE3130', name: 'Enterprise Network and Systems Security', credits: 4, level: '6', year: 3, semester: 2, specializations: ['CSNE'], department: 'Computing' },

  // CSNE Specialization - Year 4 Semester 1
  { code: 'IE4090', name: 'DevOps', credits: 4, level: '7', year: 4, semester: 1, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE4100', name: 'Network Storage and Architecture', credits: 4, level: '7', year: 4, semester: 1, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE4112', name: 'Data & Systems Security', credits: 4, level: '7', year: 4, semester: 1, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE4102', name: 'Governance, Risk Management & Compliance', credits: 4, level: '7', year: 4, semester: 1, specializations: ['CSNE'], department: 'Computing' },

  // CSNE Specialization - Year 4 Semester 2
  { code: 'IE4110', name: 'Software Defined Networks', credits: 4, level: '7', year: 4, semester: 2, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE4120', name: 'Robotics and Intelligent Systems', credits: 4, level: '7', year: 4, semester: 2, specializations: ['CSNE'], department: 'Computing' },
  { code: 'IE4130', name: 'Internet of Things', credits: 4, level: '7', year: 4, semester: 2, specializations: ['CSNE'], department: 'Computing' },

  // DS Specialization - Year 3 Semester 1
  { code: 'IT3081', name: 'Statistical Modelling', credits: 4, level: '6', year: 3, semester: 1, specializations: ['DS'], department: 'Computing' },
  { code: 'IT3091', name: 'Machine Learning', credits: 4, level: '6', year: 3, semester: 1, specializations: ['DS'], department: 'Computing' },
  { code: 'IT3101', name: 'Data Warehousing and Business Intelligence', credits: 4, level: '6', year: 3, semester: 1, specializations: ['DS'], department: 'Computing' },

  // DS Specialization - Year 3 Semester 2
  { code: 'IT3111', name: 'Deep Learning', credits: 4, level: '6', year: 3, semester: 2, specializations: ['DS'], department: 'Computing' },
  { code: 'IT3121', name: 'Cloud Data Analytics', credits: 4, level: '6', year: 3, semester: 2, specializations: ['DS'], department: 'Computing' },

  // DS Specialization - Year 4 Semester 1
  { code: 'IT4051', name: 'Modern Topics in Data Science', credits: 4, level: '7', year: 4, semester: 1, specializations: ['DS'], department: 'Computing' },
  { code: 'IT4061', name: 'Natural Language Processing', credits: 4, level: '7', year: 4, semester: 1, specializations: ['DS'], department: 'Computing' },
  { code: 'IT4081', name: 'Software Engineering Concepts', credits: 4, level: '7', year: 4, semester: 1, specializations: ['DS'], department: 'Computing' },
  { code: 'IT4091', name: 'Optimization Methods', credits: 4, level: '7', year: 4, semester: 1, specializations: ['DS'], department: 'Computing' },

  // DS Specialization - Year 4 Semester 2
  { code: 'IT4071', name: 'Data Governance, Privacy and Security', credits: 4, level: '7', year: 4, semester: 2, specializations: ['DS'], department: 'Computing' },
  { code: 'IT4101', name: 'Database Implementation and Administration', credits: 4, level: '7', year: 4, semester: 2, specializations: ['DS'], department: 'Computing' },
  { code: 'IT4111', name: 'MLOps for Data Analytics', credits: 4, level: '7', year: 4, semester: 2, specializations: ['DS'], department: 'Computing' },
];

const seedModules = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in .env file');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing modules
    await Module.deleteMany({});
    console.log('🗑️ Cleared existing modules');

    // Insert all modules
    const modules = await Module.insertMany(MODULES_DATA);
    console.log(`✅ Seeded ${modules.length} modules successfully`);

    // Verify by counting
    const count = await Module.countDocuments();
    console.log(`📊 Total modules in database: ${count}`);

    // Show sample of modules
    const sample = await Module.find().limit(5);
    console.log('📋 Sample modules:', sample.map(m => `${m.code} - ${m.name}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding modules:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedModules();
}

module.exports = { seedModules, MODULES_DATA };
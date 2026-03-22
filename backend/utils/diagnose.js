const mongoose = require('mongoose');
const Module = require('../models/Module');
require('dotenv').config();

const diagnose = async () => {
  try {
    console.log('1️⃣ Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('2️⃣ Checking Module collection...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const moduleCollection = collections.find(c => c.name === 'modules');
    console.log('Module collection exists:', !!moduleCollection);
    
    console.log('3️⃣ Counting modules...');
    const count = await Module.countDocuments();
    console.log(`📊 Modules count: ${count}`);
    
    if (count > 0) {
      console.log('4️⃣ Fetching first 5 modules:');
      const modules = await Module.find().limit(5);
      modules.forEach(m => {
        console.log(`   - ${m.code}: ${m.name}`);
      });
    } else {
      console.log('⚠️ No modules found! Please run seed script.');
      console.log('   Run: node utils/seedModules.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

diagnose();
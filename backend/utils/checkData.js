const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const Module = require('../models/Module');
require('dotenv').config({ path: '../.env' });

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check modules
    const moduleCount = await Module.countDocuments();
    console.log(`📚 Modules: ${moduleCount}`);

    // Check resources
    const resourceCount = await Resource.countDocuments();
    console.log(`📄 Resources: ${resourceCount}`);

    if (resourceCount > 0) {
      // Show status breakdown
      const approved = await Resource.countDocuments({ status: 'approved' });
      const pending = await Resource.countDocuments({ status: 'pending' });
      const rejected = await Resource.countDocuments({ status: 'rejected' });
      
      console.log('   ├─ Approved:', approved);
      console.log('   ├─ Pending:', pending);
      console.log('   └─ Rejected:', rejected);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
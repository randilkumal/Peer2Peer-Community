require('dotenv').config();
const mongoose = require('mongoose');
const { seedModules } = require('./utils/seedModules');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Seed modules
    await seedModules();

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
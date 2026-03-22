require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4 // force IPv4
}).then(() => {
  console.log('✅ Connected to MongoDB!');
  process.exit(0);
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

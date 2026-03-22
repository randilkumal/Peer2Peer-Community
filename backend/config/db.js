const mongoose = require('mongoose');
const dns = require('dns');

// Intercept Node's DNS lookup to bypass strict local network blocks for MongoDB
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']); // Use Google Public DNS

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (hostname && hostname.includes('.mongodb.net')) {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return originalLookup(hostname, options, callback);
      }
      // Return the resolved IP to Mongoose
      callback(null, addresses[0], 4);
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ Missing MONGODB_URI in .env (see .env.example)');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
    console.log('✅ MongoDB Connected: ' + conn.connection.host);
  } catch (error) {
    console.error('❌ Error: ' + error.message);
    const msg = String(error.message || '');
    if (
      msg.includes('whitelist') ||
      msg.includes('IP') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('Server selection timed out')
    ) {
      console.error('');
      console.error('If using Atlas: Network Access → add your current IP (or 0.0.0.0/0 for dev only).');
      console.error('If using local MongoDB: install MongoDB Community Server and set MONGODB_URI=mongodb://127.0.0.1:27017/p2p-platform');
      console.error('');
    }
    process.exit(1);
  }
};

module.exports = connectDB;

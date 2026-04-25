require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Resource = require('./backend/models/Resource');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find a resource with a pending update
  const resource = await Resource.findOne({ 'pendingUpdate.status': 'pending' });
  if (!resource) {
    console.log('No resources with pending updates found');
    process.exit(0);
  }

  console.log('Found resource before approval:', {
    _id: resource._id,
    title: resource.title,
    pendingUpdate: resource.pendingUpdate
  });

  // Simulate approve resource logic
  resource.title = resource.pendingUpdate.title;
  resource.description = resource.pendingUpdate.description;
  resource.moduleCode = resource.pendingUpdate.moduleCode;
  if (resource.pendingUpdate.type) resource.type = resource.pendingUpdate.type;
  
  // Clear pending update using undefined
  resource.pendingUpdate = undefined;
  
  await resource.save();
  console.log('Saved resource successfully');

  // Fetch it again to see what was actually saved
  const refetched = await Resource.findById(resource._id);
  console.log('Refetched resource after approval:', {
    _id: refetched._id,
    title: refetched.title,
    pendingUpdate: refetched.pendingUpdate
  });

  process.exit(0);
}

run().catch(console.error);

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: String, // File path if uploaded
  category: {
    type: String,
    enum: ['Question', 'Notice', 'Announcement', 'General'],
    default: 'General'
  },
  
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending' // Admin posts auto-approved in controller
  },
  rejectionReason: String,
  
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model('Post', postSchema);

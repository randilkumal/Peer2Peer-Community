// //models/sessionRequest.js
// const mongoose = require('mongoose');

// const sessionRequestSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   topic: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   moduleCode: {
//     type: String,
//     trim: true
//   },
//   reason: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// module.exports = mongoose.model('SessionRequest', sessionRequestSchema);


const mongoose = require('mongoose');

const sessionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  moduleCode: {
    type: String,
    trim: true,
    default: ''
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // NEW: message delivery status (for student/admin visibility)
  messageStatus: {
    type: String,
    enum: ['delivered', 'seen'],
    default: 'delivered'
  },
  // NEW FIELDS
  adminNote: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Index for faster queries
sessionRequestSchema.index({ user: 1, status: 1 });
sessionRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SessionRequest', sessionRequestSchema);
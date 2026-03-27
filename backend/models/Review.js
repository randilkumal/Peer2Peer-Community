const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewType: {
    type: String,
    enum: ['resource', 'expert'],
    required: true
  },
  // If reviewType is 'resource'
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  // Legacy fields for backward compatibility
  resourceId: {
    type: String
  },
  type: {
    type: String
  },
  // If reviewType is 'expert'
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  // Common fields
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per resource
ReviewSchema.index(
  { resource: 1, reviewer: 1 },
  { unique: true, partialFilterExpression: { resource: { $exists: true, $type: 'objectId' } } }
);

// Prevent user from submitting more than one review per expert per session
ReviewSchema.index(
  { expert: 1, session: 1, reviewer: 1 },
  { unique: true, partialFilterExpression: { expert: { $exists: true, $type: 'objectId' }, session: { $exists: true, $type: 'objectId' } } }
);

module.exports = mongoose.model('Review', ReviewSchema);

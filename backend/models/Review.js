const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // What is being reviewed
  reviewType: {
    type: String,
    enum: ['expert', 'resource'],
    required: true
  },
  
  // Expert Review
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  
  // Resource Review
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  
  // Reviewer
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Rating & Comment
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ 
  reviewType: 1, 
  expert: 1, 
  session: 1, 
  reviewer: 1 
}, { 
  unique: true,
  sparse: true // Allows nulls in expert/session fields
});

reviewSchema.index({ 
  reviewType: 1, 
  resource: 1, 
  reviewer: 1 
}, { 
  unique: true,
  sparse: true
});

// Index for efficient querying
reviewSchema.index({ expert: 1 });
reviewSchema.index({ resource: 1 });

module.exports = mongoose.model('Review', reviewSchema);

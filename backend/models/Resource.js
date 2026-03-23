const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['Lecture Notes', 'Past Papers', 'Assignments', 'Textbooks', 'Study Guides', 'Other'],
    default: 'Other'
  },
  moduleCode: {
    type: String,
    required: [true, 'Module code is required'],
    trim: true,
    uppercase: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      ratedAt: { type: Date, default: Date.now }
    }
  ],
  downloadedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      downloadedAt: { type: Date, default: Date.now }
    }
  ],
  metadata: {
    fileSize: Number,
    fileType: String
  }
}, {
  timestamps: true
});

// Index for search
resourceSchema.index({ title: 'text', description: 'text', moduleCode: 'text' });
resourceSchema.index({ status: 1, moduleCode: 1 });
resourceSchema.index({ uploadedBy: 1, status: 1 });
resourceSchema.index({ 'downloadedBy.user': 1 });

module.exports = mongoose.model('Resource', resourceSchema);

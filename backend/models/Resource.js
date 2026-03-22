// const mongoose = require('mongoose');

// const resourceSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   module: {
//     type: String,
//     required: true
//   },
  
//   // Academic Context
//   academicYear: Number,
//   period: {
//     type: String,
//     enum: ['Jan-May', 'Jun-Nov']
//   },
//   yearLevel: Number,
  
//   // Resource Details
//   resourceType: {
//     type: String,
//     enum: ['Notes', 'Assignment', 'Past Paper', 'Other'],
//     required: true
//   },
//   tags: [String],
  
//   // File
//   filePath: {
//     type: String,
//     required: true
//   },
//   fileName: String,
//   fileSize: Number,
//   fileType: String, // application/pdf, etc.
  
//   // Uploader
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
//   // Status
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   rejectionReason: String,
  
//   // Ratings
//   averageRating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   totalRatings: {
//     type: Number,
//     default: 0
//   },
  
//   // Analytics
//   downloadCount: {
//     type: Number,
//     default: 0
//   },
//   viewCount: {
//     type: Number,
//     default: 0
//   },
  
//   // Metadata
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Index for efficient querying
// resourceSchema.index({ status: 1, module: 1, yearLevel: 1 });
// resourceSchema.index({ uploadedBy: 1 });
// resourceSchema.index({ tags: 1 });

// module.exports = mongoose.model('Resource', resourceSchema);



const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Lecture Notes', 'Assignments', 'Past Papers', 'Textbooks', 'Other'],
    required: true
  },
  moduleCode: {
    type: String,
    required: [true, 'Please specify the module']
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  // NEW: Track who downloaded
  downloadedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  metadata: {
    fileSize: Number,
    fileType: String
  }
}, {
  timestamps: true
});

// Index for search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
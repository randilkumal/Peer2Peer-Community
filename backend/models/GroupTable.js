const mongoose = require('mongoose');

const groupTableSchema = new mongoose.Schema({
  // Module Offering Reference
  moduleOffering: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModuleOffering',
    required: false
  },
  module: {
    type: String,
    required: true
  },
  moduleName: String,
  assignmentTitle: {
    type: String,
    required: true
  },
  
  // Academic Context (denormalized for easy filtering)
  academicYear: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    enum: ['Jan-May', 'Jun-Nov'],
    required: true
  },
  yearLevel: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    enum: [1, 2],
    required: true
  },
  specialization: {
    type: String,
    enum: ['IT', 'SE', 'DS', 'CSNE', 'All'],
    required: true
  },
  
  // Table Configuration
  numberOfGroups: {
    type: Number,
    required: true
  },
  groupSize: {
    type: Number,
    required: true
  },
  
  // Registration Period
  registrationDeadline: {
    type: Date,
    required: true
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['open', 'closed', 'published'],
    default: 'open'
  },
  publishedAt: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
groupTableSchema.index({ 
  module: 1, 
  academicYear: 1, 
  period: 1, 
  yearLevel: 1,
  specialization: 1 
});
groupTableSchema.index({ createdBy: 1 });
groupTableSchema.index({ status: 1 });

module.exports = mongoose.model('GroupTable', groupTableSchema);

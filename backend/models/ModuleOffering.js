const mongoose = require('mongoose');

// This handles the academic context - same module can be offered in different years/semesters
const moduleOfferingSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  moduleCode: {
    type: String,
    required: true
  },
  moduleName: String,
  
  // Academic Context
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
  
  // Lecturer Assignment
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness per context
moduleOfferingSchema.index({ 
  moduleCode: 1, 
  academicYear: 1, 
  period: 1, 
  yearLevel: 1,
  semester: 1,
  specialization: 1
}, { unique: true });

module.exports = mongoose.model('ModuleOffering', moduleOfferingSchema);

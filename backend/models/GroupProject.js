const mongoose = require('mongoose');

const groupProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  moduleCode: {
    type: String,
    required: [true, 'Module code is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required']
  },
  groupCount: {
    type: Number,
    required: [true, 'Group count is required'],
    min: 1
  },
  groupSize: {
    type: Number,
    required: [true, 'Group size is required'],
    min: 1
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'published'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GroupProject', groupProjectSchema);

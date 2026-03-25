
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  credits: {
    type: Number,
    min: 0
  },
  level: {
    type: String,
    enum: ['4', '5', '6', '7'],
    default: '4'
  },
  semester: {
    type: String,
    enum: ['1', '2', 'Both'],
    default: '1'
  },
  department: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Module', moduleSchema);
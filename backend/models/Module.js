// const mongoose = require('mongoose');

// const moduleSchema = new mongoose.Schema({
//   code: {
//     type: String,
//     required: true,
//     unique: true,
//     uppercase: true,
//     trim: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   credits: {
//     type: Number,
//     required: true
//   },
//   yearLevel: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 4
//   },
//   semester: {
//     type: Number,
//     required: true,
//     enum: [1, 2]
//   },
//   specializations: [{
//     type: String,
//     enum: ['IT', 'SE', 'DS', 'CSNE', 'All']
//   }],
//   description: String,
//   prerequisites: [{
//     type: String // Module codes
//   }]
// }, {
//   timestamps: true
// });

// // Index for efficient querying
// moduleSchema.index({ yearLevel: 1, semester: 1, specializations: 1 });

// module.exports = mongoose.model('Module', moduleSchema);

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
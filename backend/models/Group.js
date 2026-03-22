const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  studentId: String,
  email: String,
  phone: String,
  isLeader: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  groupTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupTable',
    required: true
  },
  groupNumber: {
    type: Number,
    required: true
  },
  batch: String,
  
  // Members
  members: [memberSchema],
  maxMembers: {
    type: Number,
    required: true
  },
  
  // Assignment Type
  assignmentType: {
    type: String,
    enum: ['self-registered', 'auto-assigned', 'manually-assigned'],
    default: 'self-registered'
  },
  
  // Status
  isFull: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
groupSchema.index({ groupTable: 1, groupNumber: 1 }, { unique: true });
groupSchema.index({ 'members.user': 1 });

// Virtual for current member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.filter(m => m.user || m.name).length;
});

// Method to check if student is already in a group for this table
groupSchema.statics.isStudentInAnyGroup = async function(groupTableId, userId) {
  const group = await this.findOne({
    groupTable: groupTableId,
    'members.user': userId
  });
  return group !== null;
};

module.exports = mongoose.model('Group', groupSchema);

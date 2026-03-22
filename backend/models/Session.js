const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Module / subject
  moduleCode: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },
  
  // Session schedule details (filled when moving to pending/confirmed)
  date: Date,
  startTime: String,
  endTime: String,
  isOnline: {
    type: Boolean,
    default: false
  },
  venue: String,       // Physical location
  meetingLink: String, // Online meeting URL
  additionalNotes: String,
  
  // Requirements for activating a session
  requiredStudents: {
    type: Number,
    default: 25
  },
  requiredExperts: {
    type: Number,
    default: 1
  },
  
  // Capacity for UI
  maxParticipants: {
    type: Number,
    default: 25
  },
  
  // Participants (approved)
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Assigned expert who will conduct the session
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Join / volunteer requests awaiting admin decision
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'expert'],
      default: 'student'
    },
    reason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status Workflow: requested → pending → confirmed → completed / cancelled
  status: {
    type: String,
    enum: ['requested', 'pending', 'confirmed', 'completed', 'cancelled'],
    default: 'requested'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Admin who created the announcement
  },
  completedAt: Date
}, {
  timestamps: true
});

// Virtual for checking if minimum requirements are met
sessionSchema.virtual('conditionsMet').get(function() {
  const approvedStudentCount = this.participants.length;
  const hasExpert = !!this.expert;
  return approvedStudentCount >= this.requiredStudents && hasExpert;
});

// Indexes for efficient querying
sessionSchema.index({ status: 1, moduleCode: 1 });
sessionSchema.index({ participants: 1 });
sessionSchema.index({ expert: 1 });
sessionSchema.index({ 'pendingRequests.user': 1 });

module.exports = mongoose.model('Session', sessionSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   // Basic Info
//   fullName: {
//     type: String,
//     required: [true, 'Full name is required'],
//     trim: true
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: 8,
//     select: false
//   },
//   studentId: {
//     type: String,
//     sparse: true, // Allows null values but enforces uniqueness when present
//     trim: true
//   },
//   lecturerId: {
//     type: String,
//     sparse: true,
//     trim: true
//   },
  
//   // Role & Status
//   role: {
//     type: String,
//     enum: ['student', 'expert', 'lecturer', 'admin'],
//     default: 'student'
//   },
//   status: {
//     type: String,
//     enum: ['active', 'pending', 'rejected', 'inactive'],
//     default: 'active' // Students auto-approved
//   },
  
//   // Academic Context (Student/Expert)
//   yearLevel: {
//     type: Number,
//     min: 1,
//     max: 4
//   },
//   semester: {
//     type: Number,
//     enum: [1, 2]
//   },
//   academicYear: {
//     type: Number // e.g., 2025
//   },
//   period: {
//     type: String,
//     enum: ['Jan-May', 'Jun-Nov']
//   },
//   specialization: {
//     type: String,
//     enum: ['IT', 'SE', 'DS', 'CSNE', 'None'],
//     default: 'None' // Year 1-2 have no specialization
//   },
//   batch: String, // e.g., "22.1", "23.2"
  
//   // Expert-Specific Fields
//   gpa: {
//     type: Number,
//     min: 0,
//     max: 4.0
//   },
//   masteredModules: [{
//     type: String // Module codes with A+ grade
//   }],
//   expertiseModules: [{
//     type: String // Modules expert can teach
//   }],
//   tutoringExperience: {
//     type: String,
//     enum: ['None', 'Basic', 'Gold']
//   },
//   transcript: String, // File path
//   averageRating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   totalReviews: {
//     type: Number,
//     default: 0
//   },
//   sessionsConducted: {
//     type: Number,
//     default: 0
//   },
  
//   // Lecturer-Specific Fields
//   department: {
//     type: String,
//     enum: ['IT', 'SE', 'DS', 'CSNE', 'Other']
//   },
//   position: {
//     type: String,
//     enum: ['Lecturer', 'Senior Lecturer', 'Professor']
//   },
//   teachingModules: [{
//     type: String // Module codes lecturer teaches
//   }],
  
//   // Profile Fields (All Roles)
//   profilePicture: String,
//   phone: String,
//   bio: String,
//   skills: [String],
  
//   // Metadata
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   },
//   lastLogin: Date
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Calculate profile completion percentage
// userSchema.methods.getProfileCompletion = function() {
//   const fields = [
//     'fullName', 'email', 'phone', 'bio', 'profilePicture', 
//     'yearLevel', 'semester', 'specialization'
//   ];
  
//   if (this.role === 'expert') {
//     fields.push('gpa', 'expertiseModules', 'tutoringExperience');
//   }
  
//   const filledFields = fields.filter(field => {
//     const value = this[field];
//     return value !== undefined && value !== null && value !== '' && 
//            (Array.isArray(value) ? value.length > 0 : true);
//   });
  
//   return Math.round((filledFields.length / fields.length) * 100);
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Common fields for all roles
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  studentId: {
    type: String,
    sparse: true,
    trim: true,
    required: function() {
      return this.role === 'student' || this.role === 'expert';
    }
  },
  lecturerId: {
    type: String,
    sparse: true,
    trim: true,
    required: function() {
      return this.role === 'lecturer';
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['student', 'expert', 'lecturer', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected', 'inactive'],
    default: function() {
      return this.role === 'student' ? 'active' : 'pending';
    }
  },
  profilePicture: String,
  phone: String,
  bio: String,
  skills: [String],

  // Academic context (for students and experts)
  yearLevel: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: function() {
      return this.role === 'student' || this.role === 'expert';
    }
  },
  semester: {
    type: Number,
    enum: [1, 2],
    required: function() {
      return this.role === 'student' || this.role === 'expert';
    }
  },
  academicYear: {
    type: Number,
    required: function() {
      return this.role === 'student' || this.role === 'expert';
    }
  },
  period: {
    type: String,
    enum: ['Jan-May', 'Jun-Nov'],
    required: function() {
      return this.role === 'student' || this.role === 'expert';
    }
  },
  specialization: {
    type: String,
    enum: ['IT', 'SE', 'DS', 'CSNE'],
    required: function() {
      return (this.role === 'student' || this.role === 'expert') && this.yearLevel >= 3;
    }
  },
  batch: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'expert';
    }
  },
  
  // NEW: Enrolled modules (array of module codes)
  enrolledModules: [{
    type: String,
    trim: true
  }],

  // Expert-specific fields
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
    required: function() {
      return this.role === 'expert';
    }
  },
  masteredModules: [{
    type: String,
    trim: true
  }],
  expertiseModules: [{
    type: String,
    trim: true
  }],
  tutoringExperience: {
    type: String,
    enum: ['None', 'Basic', 'Gold'],
    default: 'None'
  },
  transcript: String,
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  sessionsConducted: {
    type: Number,
    default: 0
  },

  // Lecturer-specific fields
  department: {
    type: String,
    enum: ['IT', 'SE', 'DS', 'CSNE', 'Other'],
    required: function() {
      return this.role === 'lecturer';
    }
  },
  position: {
    type: String,
    enum: ['Lecturer', 'Senior Lecturer', 'Professor'],
    required: function() {
      return this.role === 'lecturer';
    }
  },
  
  // NEW: Teaching modules (array of module codes)
  teachingModules: [{
    type: String,
    trim: true
  }],

  // Profile completion tracking
  profileCompletion: {
    type: Number,
    default: 0
  },

  // Timestamps
  lastLogin: Date,
  rejectionReason: String,

}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate profile completion
userSchema.methods.calculateProfileCompletion = function() {
  let completed = 0;
  let total = 0;

  // Common fields (30%)
  const commonFields = ['fullName', 'email', 'profilePicture', 'phone', 'bio'];
  commonFields.forEach(field => {
    total += 5;
    if (this[field]) completed += 5;
  });

  if (this.role === 'student' || this.role === 'expert') {
    if (this.studentId) completed += 5;
    total += 5;
    // Academic fields (30%)
    const academicFields = ['yearLevel', 'semester', 'academicYear', 'period', 'specialization', 'batch'];
    academicFields.forEach(field => {
      total += 5;
      if (this[field]) completed += 5;
    });

    // Enrolled modules (20%)
    total += 20;
    if (this.enrolledModules && this.enrolledModules.length > 0) {
      completed += 20;
    }

    // Expert specific (20%)
    if (this.role === 'expert') {
      const expertFields = ['gpa', 'transcript', 'tutoringExperience'];
      expertFields.forEach(field => {
        total += 6;
        if (this[field]) completed += 6;
      });
    }
  }

  if (this.role === 'lecturer') {
    if (this.lecturerId) completed += 5;
    total += 5;

    // Lecturer fields (40%)
    const lecturerFields = ['department', 'position'];
    lecturerFields.forEach(field => {
      total += 15;
      if (this[field]) completed += 15;
    });

    // Teaching modules (30%)
    total += 30;
    if (this.teachingModules && this.teachingModules.length > 0) {
      completed += 30;
    }
  }

  this.profileCompletion = Math.round((completed / total) * 100);
};

// Calculate profile completion before saving
userSchema.pre('save', function(next) {
  this.calculateProfileCompletion();
  next();
});

module.exports = mongoose.model('User', userSchema);

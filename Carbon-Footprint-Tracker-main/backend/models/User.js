const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: String,
    lastName: String,
    location: String,
    avatar: String
  },
  carbonStats: {
    totalFootprint: { type: Number, default: 0 },
    weeklyAverage: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 },
    goal: { type: Number, default: 2000 }, // kg CO2 per year
    achievements: [{ type: String }],
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 }
  },
  preferences: {
    units: { type: String, default: 'kg' }, // kg or lbs
    notifications: { type: Boolean, default: true },
    privacy: { type: String, default: 'public' } // public, private, friends
  }
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate carbon footprint level
userSchema.methods.calculateLevel = function() {
  const experience = this.carbonStats.experience;
  return Math.floor(experience / 100) + 1;
};

module.exports = mongoose.model('User', userSchema); 
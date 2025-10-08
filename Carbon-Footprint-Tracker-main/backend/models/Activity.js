const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['transport', 'electricity', 'food', 'waste', 'shopping', 'other']
  },
  subcategory: {
    type: String,
    required: true
  },
  activity: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  carbonFootprint: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: String,
  notes: String,
  tags: [String],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
activitySchema.index({ user: 1, date: -1 });
activitySchema.index({ category: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema); 
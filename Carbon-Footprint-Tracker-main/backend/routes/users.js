const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Activity = require('../models/Activity');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get user achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id });
    const achievements = [];

    // Calculate achievements based on activities
    const totalActivities = activities.length;
    const totalFootprint = activities.reduce((sum, act) => sum + act.carbonFootprint, 0);
    const categories = [...new Set(activities.map(act => act.category))];

    // Achievement checks
    if (totalActivities >= 10) achievements.push('First Steps');
    if (totalActivities >= 50) achievements.push('Dedicated Tracker');
    if (totalActivities >= 100) achievements.push('Carbon Warrior');
    
    if (totalFootprint < 1000) achievements.push('Low Carbon Hero');
    if (categories.length >= 3) achievements.push('Well Rounded');
    if (categories.length >= 5) achievements.push('Master Tracker');

    // Weekly streak achievement
    const weeklyActivities = activities.filter(act => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(act.date) >= weekAgo;
    });
    
    if (weeklyActivities.length >= 7) achievements.push('Weekly Warrior');

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user goals
router.put('/goals', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.body;
    
    if (goal && goal > 0) {
      req.user.carbonStats.goal = goal;
      await req.user.save();
    }

    res.json({ 
      message: 'Goal updated successfully',
      goal: req.user.carbonStats.goal 
    });
  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const goal = req.user.carbonStats.goal;
    const current = req.user.carbonStats.totalFootprint;
    const progress = Math.min((current / goal) * 100, 100);
    
    const weeklyProgress = req.user.carbonStats.weeklyAverage;
    const monthlyProgress = req.user.carbonStats.monthlyAverage;

    res.json({
      goal,
      current,
      progress,
      weeklyProgress,
      monthlyProgress,
      level: req.user.carbonStats.level,
      experience: req.user.carbonStats.experience
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
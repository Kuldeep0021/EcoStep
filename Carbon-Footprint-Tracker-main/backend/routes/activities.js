const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Activity = require('../models/Activity');
const User = require('../models/User');
const CarbonCalculator = require('../utils/carbonCalculator');

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

// Log a new activity
router.post('/', authenticateToken, [
  body('category').isIn(['transport', 'electricity', 'food', 'waste', 'shopping', 'other']).withMessage('Invalid category'),
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
  body('activity').notEmpty().withMessage('Activity is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('unit').notEmpty().withMessage('Unit is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, subcategory, activity, quantity, unit, location, notes, tags } = req.body;

    // Calculate carbon footprint
    const carbonFootprint = CarbonCalculator.calculateActivity(category, subcategory, activity, quantity, unit);
    
    console.log('Activity logging:', {
      category,
      subcategory,
      activity,
      quantity,
      unit,
      carbonFootprint
    });

    // Create new activity
    const newActivity = new Activity({
      user: req.user._id,
      category,
      subcategory,
      activity,
      quantity,
      unit,
      carbonFootprint,
      location,
      notes,
      tags: tags || []
    });

    await newActivity.save();
    console.log('Activity saved with ID:', newActivity._id);

    // Update user's carbon stats - recalculate from all activities
    const userActivities = await Activity.find({ user: req.user._id });
    const totalFootprint = userActivities.reduce((sum, act) => sum + act.carbonFootprint, 0);
    const weeklyAverage = CarbonCalculator.calculateWeeklyAverage(userActivities);
    const monthlyAverage = CarbonCalculator.calculateMonthlyAverage(userActivities);

    console.log('Updated stats:', {
      totalFootprint,
      weeklyAverage,
      monthlyAverage,
      activityCount: userActivities.length
    });

    // Update user stats
    req.user.carbonStats = {
      ...req.user.carbonStats,
      totalFootprint: totalFootprint,
      weeklyAverage: weeklyAverage,
      monthlyAverage: monthlyAverage,
      experience: (req.user.carbonStats?.experience || 0) + Math.floor(carbonFootprint),
      level: Math.floor((req.user.carbonStats?.experience || 0) / 100) + 1
    };

    await req.user.save();
    console.log('User stats updated successfully');

    res.status(201).json({
      message: 'Activity logged successfully',
      activity: newActivity,
      updatedStats: req.user.carbonStats
    });
  } catch (error) {
    console.error('Activity logging error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's activities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const activities = await Activity.find({
      user: req.user._id,
      date: { $gte: startDate }
    });

    console.log('Stats request:', {
      userId: req.user._id,
      period,
      activitiesFound: activities.length,
      startDate
    });

    // Calculate statistics by category
    const categoryStats = {};
    activities.forEach(activity => {
      if (!categoryStats[activity.category]) {
        categoryStats[activity.category] = {
          total: 0,
          count: 0,
          average: 0
        };
      }
      categoryStats[activity.category].total += activity.carbonFootprint;
      categoryStats[activity.category].count += 1;
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].average = categoryStats[category].total / categoryStats[category].count;
    });

    const totalFootprint = activities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);
    const daysInPeriod = Math.max(1, (new Date() - startDate) / (1000 * 60 * 60 * 24));
    const averagePerDay = totalFootprint / daysInPeriod;

    // Get all-time stats for comparison
    const allActivities = await Activity.find({ user: req.user._id });
    const allTimeTotal = allActivities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);

    // Calculate weekly and monthly averages from all activities
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyActivities = allActivities.filter(activity => 
      new Date(activity.date) >= weekAgo
    );
    const monthlyActivities = allActivities.filter(activity => 
      new Date(activity.date) >= monthAgo
    );

    const weeklyTotal = weeklyActivities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);
    const monthlyTotal = monthlyActivities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);

    const response = {
      period,
      totalFootprint,
      averagePerDay,
      categoryStats,
      activityCount: activities.length,
      allTimeTotal,
      daysInPeriod: Math.round(daysInPeriod),
      weeklyAverage: weeklyTotal,
      monthlyAverage: monthlyTotal
    };

    console.log('Stats response:', response);

    res.json(response);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggestions for reducing carbon footprint
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    
    // Get user's recent activities in the category
    const recentActivities = await Activity.find({
      user: req.user._id,
      category: category || { $exists: true }
    }).sort({ date: -1 }).limit(10);

    const currentFootprint = recentActivities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);
    
    const suggestions = CarbonCalculator.getSuggestions(category, currentFootprint);

    res.json({
      category,
      currentFootprint,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an activity
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await Activity.findByIdAndDelete(req.params.id);

    // Recalculate user stats
    const userActivities = await Activity.find({ user: req.user._id });
    const totalFootprint = userActivities.reduce((sum, act) => sum + act.carbonFootprint, 0);
    const weeklyAverage = CarbonCalculator.calculateWeeklyAverage(userActivities);
    const monthlyAverage = CarbonCalculator.calculateMonthlyAverage(userActivities);

    req.user.carbonStats.totalFootprint = totalFootprint;
    req.user.carbonStats.weeklyAverage = weeklyAverage;
    req.user.carbonStats.monthlyAverage = monthlyAverage;

    await req.user.save();

    res.json({ message: 'Activity deleted successfully', updatedStats: req.user.carbonStats });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
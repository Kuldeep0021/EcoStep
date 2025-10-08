const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    // Get users with their carbon stats, sorted by total footprint (lower is better)
    const users = await User.find({ 'preferences.privacy': 'public' })
      .select('username profile carbonStats')
      .sort({ 'carbonStats.totalFootprint': 1 }) // Lower is better
      .limit(parseInt(limit));

    // Create leaderboard with unique rankings
    const leaderboard = [];
    let currentRank = 1;
    let previousFootprint = null;
    let skipCount = 0;

    users.forEach((user, index) => {
      const footprint = user.carbonStats.totalFootprint;
      
      // If this footprint is different from the previous one, update rank
      if (previousFootprint !== null && footprint !== previousFootprint) {
        currentRank = index + 1 - skipCount;
      }
      
      // If this footprint is the same as the previous one, keep the same rank
      if (previousFootprint === footprint) {
        skipCount++;
      } else {
        skipCount = 0;
      }

      leaderboard.push({
        rank: currentRank,
        username: user.username,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        totalFootprint: footprint,
        weeklyAverage: user.carbonStats.weeklyAverage,
        monthlyAverage: user.carbonStats.monthlyAverage,
        level: user.carbonStats.level,
        goal: user.carbonStats.goal
      });

      previousFootprint = footprint;
    });

    res.json({ leaderboard, period });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's ranking
router.get('/my-ranking', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find user's rank
    const usersWithLowerFootprint = await User.countDocuments({
      'carbonStats.totalFootprint': { $lt: user.carbonStats.totalFootprint },
      'preferences.privacy': 'public'
    });

    const totalUsers = await User.countDocuments({ 'preferences.privacy': 'public' });
    const rank = usersWithLowerFootprint + 1;
    const percentile = ((totalUsers - rank + 1) / totalUsers) * 100;

    res.json({
      rank,
      totalUsers,
      percentile: Math.round(percentile),
      totalFootprint: user.carbonStats.totalFootprint,
      weeklyAverage: user.carbonStats.weeklyAverage,
      monthlyAverage: user.carbonStats.monthlyAverage
    });
  } catch (error) {
    console.error('Get my ranking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
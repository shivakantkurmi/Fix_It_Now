const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect, admin } = require('../middleware/auth');
const { kMeans } = require('../utils/clustering');

// @desc    Get Dashboard Statistics
// @route   GET /api/analytics/dashboard
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    // 1. Total Counts
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const pendingIssues = await Issue.countDocuments({ status: 'Pending' });

    // 2. Most Reported Categories
    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Average Resolution Time (Real calculation)
    const resolutionTimes = await Issue.aggregate([
      { $match: { status: 'Resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
        },
      },
    ]);

    let avgResolutionTime = 'N/A';
    if (resolutionTimes.length > 0 && resolutionTimes[0].avgResolutionTime) {
      const avgMs = resolutionTimes[0].avgResolutionTime;
      const avgDays = (avgMs / (1000 * 60 * 60 * 24)).toFixed(2);
      avgResolutionTime = `${avgDays} days`;
    }

    res.json({
      totalIssues,
      resolvedIssues,
      pendingIssues,
      categoryStats,
      avgResolutionTime,
    });
  } catch (error) {
    res.status(500).json({ message: 'Analytics Error' });
  }
});

// @desc    Get issue hotspots via K-Means clustering
// @route   GET /api/analytics/hotspots
router.get('/hotspots', protect, admin, async (req, res) => {
  try {
    const issues = await Issue.find({
      'location.lat': { $exists: true },
      'location.lng': { $exists: true },
    }).select('location category title status _id').lean();

    const points = issues.map(i => ({
      lat: i.location.lat,
      lng: i.location.lng,
      category: i.category,
      title: i.title,
      status: i.status,
      _id: i._id,
    }));

    const k = Math.min(6, Math.max(1, Math.floor(points.length / 3)));
    const clusters = kMeans(points, k);

    // Also return raw points for the scatter plot
    res.json({ clusters, points, total: points.length });
  } catch (error) {
    console.error('Hotspot error:', error);
    res.status(500).json({ message: 'Hotspot Analysis Error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect, admin } = require('../middleware/auth');

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

module.exports = router;
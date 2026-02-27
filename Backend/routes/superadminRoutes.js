const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Issue = require('../models/Issue');
const { protect, superAdmin } = require('../middleware/auth');

// GET /api/superadmin/admin-ratings
// Reads persistent stats from User documents — unaffected by the 24h issue cleanup
router.get('/admin-ratings', protect, superAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('name email totalResolved ratedCount totalRating')
      .lean();

    const result = admins.map(a => ({
      _id: a._id,
      name: a.name,
      email: a.email,
      totalResolved: a.totalResolved || 0,
      ratedCount: a.ratedCount || 0,
      avgRating: a.ratedCount > 0
        ? Math.round((a.totalRating / a.ratedCount) * 100) / 100
        : null,
    }));

    // Rated admins first (highest avg), then unrated sorted by totalResolved
    result.sort((a, b) => {
      if (a.avgRating !== null && b.avgRating !== null) return b.avgRating - a.avgRating;
      if (a.avgRating !== null) return -1;
      if (b.avgRating !== null) return 1;
      return b.totalResolved - a.totalResolved;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/superadmin/admins
// List all admin accounts
router.get('/admins', protect, superAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').lean();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/superadmin/issues
// Full issue list with resolver info
router.get('/issues', protect, superAdmin, async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('user', 'name email phone')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

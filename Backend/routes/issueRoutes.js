// routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect, admin } = require('../middleware/auth');

// Helper: Decide what user fields to populate
const populateUser = (req) => {
  return req.user?.role === 'admin' 
    ? 'name email phone'  // Admin sees full contact
    : 'name';             // Citizen sees only name
};

// @desc    Create a new issue
// @route   POST /api/issues
router.post('/', protect, async (req, res) => {
  const { title, description, category, imageUrl, location } = req.body;

  try {
    const issue = new Issue({
      user: req.user._id,
      title,
      description,
      category,
      imageUrl,
      location,
      status: 'Pending',
    });

    const createdIssue = await issue.save();
    const populated = await Issue.findById(createdIssue._id).populate('user', populateUser(req));
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create issue' });
  }
});

// @desc    Get all issues (with privacy control)
// @route   GET /api/issues
router.get('/', protect, async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    let query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;

    const count = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate('user', populateUser(req))  // ← Dynamic privacy
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ issues, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get my issues (full details for owner)
// @route   GET /api/issues/my
router.get('/my', protect, async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my issues' });
  }
});

// @desc    Get Issue by ID (with privacy)
// @route   GET /api/issues/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('user', populateUser(req));  // ← Privacy applied here too

    if (issue) {
      res.json(issue);
    } else {
      res.status(404).json({ message: 'Issue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update Issue Status (Admin only)
// @route   PUT /api/issues/:id/status
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status, resolutionEvidenceUrl } = req.body;
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status || issue.status;
    if (status === 'Resolved') issue.resolvedAt = new Date();
    if (resolutionEvidenceUrl) issue.resolutionEvidenceUrl = resolutionEvidenceUrl;

    const updatedIssue = await issue.save();
    const populated = await Issue.findById(updatedIssue._id).populate('user', 'name email phone');
    
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// @desc    Delete an issue (Only owner + not resolved)
// @route   DELETE /api/issues/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (issue.status === 'Resolved') {
      return res.status(400).json({ message: 'Resolved issues are auto-deleted after 24 hours' });
    }

    await issue.deleteOne();
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add Feedback (Citizen only)
// @route   PUT /api/issues/:id/feedback
router.put('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (issue.status !== 'Resolved') {
      return res.status(400).json({ message: 'Can only rate resolved issues' });
    }

    issue.feedback = { rating, comment };
    const updated = await issue.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// @desc    AI Auto-Detect Category (Mock)
// @route   POST /api/issues/ai-detect
router.post('/ai-detect', protect, (req, res) => {
  const categories = ['Pothole', 'Garbage', 'Street Light', 'Water Leakage', 'Electricity', 'Other'];
  const detected = categories[Math.floor(Math.random() * categories.length)];
  
  res.json({ 
    category: detected, 
    confidence: Math.floor(Math.random() * 20) + 80 + '%',
    message: 'AI detection successful (Mock)'
  });
});

module.exports = router;
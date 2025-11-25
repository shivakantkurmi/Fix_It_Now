const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect, admin } = require('../middleware/auth');

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
    res.status(201).json(createdIssue);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create issue' });
  }
});

// @desc    Get all issues (All users see all for heatmap; privacy: only user name)
// @route   GET /api/issues
router.get('/', protect, async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    let query = {};
    
    // Filtering logic
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;

    const count = await Issue.countDocuments(query);
    const issues = await Issue.find(query)
      .populate('user', 'name') // Only name for privacy
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ issues, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get my issues (Citizen's own issues)
// @route   GET /api/issues/my
router.get('/my', protect, async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my issues' });
  }
});

// @desc    Get Issue by ID
// @route   GET /api/issues/:id
router.get('/:id', protect, async (req, res) => {
  const issue = await Issue.findById(req.params.id).populate('user', 'name'); // Only name
  if (issue) {
    res.json(issue);
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
});

// @desc    Update Issue Status (Admin only)
// @route   PUT /api/issues/:id/status
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status, resolutionEvidenceUrl } = req.body;
  const issue = await Issue.findById(req.params.id);

  if (issue) {
    issue.status = status || issue.status;
    if (status === 'Resolved') {
      issue.resolvedAt = new Date(); // Set resolved timestamp
    }
    if (resolutionEvidenceUrl) {
      issue.resolutionEvidenceUrl = resolutionEvidenceUrl;
    }
    
    // Simulate Push Notification here
    console.log(`NOTIFICATION: Notify User ${issue.user} that status changed to ${issue.status}`);

    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
});


// @desc    Delete an issue (Only Owner OR Auto-delete after 24h of Resolved)
// @route   DELETE /api/issues/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Allow only the owner to delete
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this complaint' });
    }

    // Optional: Prevent deleting already resolved issues manually (they auto-delete)
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
  const issue = await Issue.findById(req.params.id);

  if (issue) {
    // Ensure only the creator can give feedback
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to rate this issue' });
    }

    if (issue.status !== 'Resolved') {
      return res.status(400).json({ message: 'Can only rate resolved issues' });
    }

    issue.feedback = { rating, comment };
    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } else {
    res.status(404).json({ message: 'Issue not found' });
  }
});

// @desc    AI Auto-Detect Category (Mock)
// @route   POST /api/issues/ai-detect
router.post('/ai-detect', protect, (req, res) => {
  const { imageUrl } = req.body;
  
  // In a real app, you would send this URL to a Python/Flask microservice or TensorFlow model
  // Here we simulate randomness for demonstration
  const categories = ['Pothole', 'Garbage', 'Street Light', 'Water Leakage'];
  const detected = categories[Math.floor(Math.random() * categories.length)];
  
  res.json({ 
    category: detected, 
    confidence: '92%',
    message: 'AI detection successful (Mock)'
  });
});

module.exports = router;
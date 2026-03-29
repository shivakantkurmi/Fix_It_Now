// routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { findDuplicates } = require('../utils/nlp');

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

    const wasAlreadyResolved = issue.status === 'Resolved';
    issue.status = status || issue.status;
    if (status === 'Resolved' && !wasAlreadyResolved) {
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user._id;
      // Persist resolved count on the admin user — survives issue cleanup
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalResolved: 1 } });
    }
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

    const previousRating = issue.feedback?.rating ?? null;
    issue.feedback = { rating, comment };
    const updated = await issue.save();

    // Persist rating stats on the resolving admin — survives issue cleanup
    if (issue.resolvedBy) {
      if (previousRating === null) {
        // First time rated — increment count and add to total
        await User.findByIdAndUpdate(issue.resolvedBy, {
          $inc: { ratedCount: 1, totalRating: rating },
        });
      } else {
        // Updated rating — adjust total without changing count
        await User.findByIdAndUpdate(issue.resolvedBy, {
          $inc: { totalRating: rating - previousRating },
        });
      }
    }

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

// @desc    Check for duplicate / similar nearby issues (NLP + Geo)
// @route   POST /api/issues/check-duplicate
router.post('/check-duplicate', protect, async (req, res) => {
  const { description, lat, lng } = req.body;
  if (!description || lat == null || lng == null) {
    return res.status(400).json({ message: 'description, lat and lng are required' });
  }
  try {
    const openIssues = await Issue.find({
      status: { $in: ['Pending', 'In Progress'] },
      'location.lat': { $exists: true },
    }).select('title description category location status createdAt').lean();

    const duplicates = findDuplicates({ description, lat: Number(lat), lng: Number(lng) }, openIssues);
    res.json({ duplicates, count: duplicates.length });
  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({ message: 'Server error during duplicate check' });
  }
});

// @desc    Predict issue priority using ML (Calibrated LinearSVC) with keyword heuristic fallback
// @route   POST /api/issues/predict-priority
router.post('/predict-priority', protect, async (req, res) => {
  const { category = '', description = '' } = req.body;

  // ── Try the Python ML micro-service first ──────────────────────────────────
  const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:5001';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5 s timeout

    const mlRes = await fetch(`${ML_SERVICE}/predict-priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (mlRes.ok) {
      const data = await mlRes.json();
      return res.json({
        priority:   data.priority,
        confidence: data.confidence,
        source:     'ml',           // tells the frontend which engine was used
        probabilities: data.probabilities,
      });
    }
  } catch (_) {
    // ML service unavailable — fall through to heuristic
  }

  // ── Keyword heuristic fallback ─────────────────────────────────────────────
  const HIGH_KEYWORDS = ['urgent', 'dangerous', 'accident', 'fire', 'flood', 'broken', 'exposed',
    'electric shock', 'live wire', 'major', 'critical', 'collapse', 'sewage overflow',
    'no water', 'days', 'weeks', 'bleeding', 'injury', 'blocked road', 'no electricity'];
  const LOW_KEYWORDS  = ['minor', 'small', 'little', 'slight', 'cosmetic', 'repaint', 'scratch',
    'aesthetic', 'paint', 'look'];

  const HIGH_CATS = ['Electricity', 'Water Leakage'];
  const LOW_CATS  = ['Garbage', 'Other'];

  const desc = description.toLowerCase();
  let score = 0;

  HIGH_KEYWORDS.forEach(kw => { if (desc.includes(kw)) score += 2; });
  LOW_KEYWORDS.forEach(kw  => { if (desc.includes(kw)) score -= 2; });

  if (HIGH_CATS.includes(category))     score += 3;
  else if (LOW_CATS.includes(category)) score -= 1;
  else                                   score += 1;

  let priority = 'Medium';
  if (score >= 4)       priority = 'High';
  else if (score <= -1) priority = 'Low';

  const confidence = Math.min(65 + Math.abs(score) * 5, 95);
  return res.json({ priority, confidence: `${confidence}%`, source: 'heuristic', score });
});

module.exports = router;
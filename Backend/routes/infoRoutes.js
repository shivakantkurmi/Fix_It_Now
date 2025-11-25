// routes/infoRoutes.js
const express = require('express');
const router = express.Router();
const Info = require('../models/Info');
const { protect, admin } = require('../middleware/auth');

// GET all schemes/facilities
router.get('/', async (req, res) => {
  try {
    const { type, region } = req.query;
    const query = {};
    if (type) query.type = type;
    if (region && region !== 'All') query.region = region;

    const infos = await Info.find(query).sort({ createdAt: -1 });
    res.json(infos);
  } catch (error) {
    console.error('GET /info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE (Admin only)
// routes/infoRoutes.js
router.post('/', protect, admin, async (req, res) => {
  try {
    const { type, title, description, region = 'All' } = req.body;

    if (!type || !title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Title, description and type are required' });
    }

    const info = new Info({
      type,
      title: title.trim(),
      description: description.trim(),
      region,
      // Optional fields will be auto-filled by pre-save hook
    });

    const saved = await info.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('POST /info error:', error);
    res.status(500).json({ 
      message: 'Failed to create info', 
      error: error.message 
    });
  }
});

// UPDATE
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const info = await Info.findById(req.params.id);
    if (!info) return res.status(404).json({ message: 'Not found' });

    const { title, description, region, eligibility, benefits, contactInfo, address, operatingHours } = req.body;

    info.title = title?.trim() || info.title;
    info.description = description?.trim() || info.description;
    info.region = region || info.region;

    if (info.type === 'Scheme') {
      info.eligibility = eligibility?.trim() || info.eligibility;
      info.benefits = benefits?.trim() || info.benefits;
    } else {
      info.contactInfo = contactInfo?.trim() || info.contactInfo;
      info.address = address?.trim() || info.address;
      info.operatingHours = operatingHours?.trim() || info.operatingHours;
    }

    const updated = await info.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// DELETE
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const info = await Info.findByIdAndDelete(req.params.id);
    if (!info) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
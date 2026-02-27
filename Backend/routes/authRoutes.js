const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, languagePreference } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      role: ['citizen', 'admin'].includes(role) ? role : 'citizen',
      phone,
      languagePreference,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// VERIFY TOKEN  (THIS WAS MISSING)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});
// @desc  Get current user's profile
// @route GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc  Update current user's profile
// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, languagePreference, currentPassword, newPassword } = req.body;

    if (name)               user.name = name.trim();
    if (phone !== undefined && phone !== null) user.phone = String(phone).trim();
    if (languagePreference) user.languagePreference = languagePreference;

    // Password change - requires current password verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
      user.password = newPassword; // pre-save hook will hash it
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      languagePreference: updated.languagePreference,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;

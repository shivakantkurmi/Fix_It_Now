// Backend/models/Info.js
const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Scheme', 'Facility'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    region: { type: String, enum: ['All', 'Rural', 'Urban'], default: 'All' },

    // Scheme fields
    eligibility: String,
    benefits: String,
    website: String,  // ← Properly placed

    // Facility fields
    contactInfo: String,
    address: String,
    operatingHours: String,

    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

// Auto-fill defaults
infoSchema.pre('save', function () {
  if (this.type === 'Scheme') {
    this.eligibility = this.eligibility || 'Not specified';
    this.benefits = this.benefits || 'Not specified';
  }
  if (this.type === 'Facility') {
    this.contactInfo = this.contactInfo || 'Not specified';
    this.address = this.address || 'Not specified';
    this.operatingHours = this.operatingHours || '9:00 AM - 5:00 PM';
  }
});

module.exports = mongoose.model('Info', infoSchema);
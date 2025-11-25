// Backend/models/Info.js
const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Scheme', 'Facility'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      enum: ['All', 'Rural', 'Urban'],
      default: 'All',
    },
    eligibility: String,
    benefits: String,
    contactInfo: String,
    address: String,
    operatingHours: String,
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

// CORRECT WAY – NO 'next' parameter in Mongoose 6+
infoSchema.pre('save', async function () {
  // Auto-fill optional fields based on type
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

const Info = mongoose.model('Info', infoSchema);
module.exports = Info;
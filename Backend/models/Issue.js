const mongoose = require('mongoose');

const issueSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Pothole', 'Garbage', 'Street Light', 'Water Leakage', 'Electricity', 'Other'],
    },
    imageUrl: {
      type: String,
      required: false, // Optional but recommended
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String }, // Human readable address
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    assignedTo: {
      type: String, // Could be an admin name or department
      default: 'Unassigned',
    },
    resolutionEvidenceUrl: {
      type: String, // Photo of resolved issue
    },
    resolvedAt: {
      type: Date, // Added for analytics
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;
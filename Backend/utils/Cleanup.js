// utils/cleanup.js
const Issue = require('../models/Issue');

const cleanupResolvedIssues = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Issue.deleteMany({
      status: 'Resolved',
      resolvedAt: { $lt: oneDayAgo }
    });

    console.log(`Cleanup: Deleted ${result.deletedCount} resolved complaints older than 24 hours`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

module.exports = cleanupResolvedIssues;
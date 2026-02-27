// utils/nlp.js — TF-IDF cosine similarity + Haversine distance for duplicate detection

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function buildTFVector(doc) {
  const tokens = tokenize(doc);
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  Object.keys(tf).forEach(t => { tf[t] /= tokens.length; });
  return tf;
}

function cosineSimilarity(v1, v2) {
  const terms = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let dot = 0, mag1 = 0, mag2 = 0;
  terms.forEach(t => {
    const a = v1[t] || 0;
    const b = v2[t] || 0;
    dot += a * b;
    mag1 += a * a;
    mag2 += b * b;
  });
  if (!mag1 || !mag2) return 0;
  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

// Haversine distance in km between two GPS points
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find potential duplicate issues
 * @param {Object} newIssue - { description, lat, lng, category }
 * @param {Array}  existingIssues - Array of issue documents from DB
 * @param {number} textThreshold  - Min cosine similarity (0–1), default 0.35
 * @param {number} geoThresholdKm - Max distance in km, default 0.5 (500m)
 * @returns {Array} Up to 3 similar issues
 */
function findDuplicates(newIssue, existingIssues, textThreshold = 0.35, geoThresholdKm = 0.5) {
  const v1 = buildTFVector(newIssue.description);

  const results = existingIssues
    .map(issue => {
      const v2 = buildTFVector(issue.description);
      const textSim = cosineSimilarity(v1, v2);
      const geoKm = haversineDistance(
        newIssue.lat, newIssue.lng,
        issue.location.lat, issue.location.lng
      );
      return { issue, textSim, geoKm };
    })
    .filter(({ textSim, geoKm }) => textSim >= textThreshold && geoKm <= geoThresholdKm)
    .sort((a, b) => b.textSim - a.textSim)
    .slice(0, 3)
    .map(({ issue, textSim, geoKm }) => ({
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      location: issue.location,
      createdAt: issue.createdAt,
      similarity: Math.round(textSim * 100),
      distanceM: Math.round(geoKm * 1000),
    }));

  return results;
}

module.exports = { findDuplicates, haversineDistance };

// utils/clustering.js — K-Means clustering for issue hotspot detection

/**
 * Run K-Means clustering on an array of GPS points.
 * @param {Array} points  - Array of { lat, lng, category, _id }
 * @param {number} k      - Number of clusters (default 6)
 * @param {number} maxIter - Max iterations (default 50)
 * @returns {Array} Cluster objects sorted by density (largest first)
 */
function kMeans(points, k = 6, maxIter = 50) {
  if (!points || points.length === 0) return [];
  k = Math.min(k, points.length);

  // Initialise centroids using K-Means++ style (random spread)
  const shuffled = [...points].sort(() => Math.random() - 0.5);
  let centroids = shuffled.slice(0, k).map(p => ({ lat: p.lat, lng: p.lng }));

  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    // Assignment step – assign each point to nearest centroid
    points.forEach((p, i) => {
      let minDist = Infinity;
      let nearest = 0;
      centroids.forEach((c, ci) => {
        const dist = Math.sqrt((p.lat - c.lat) ** 2 + (p.lng - c.lng) ** 2);
        if (dist < minDist) { minDist = dist; nearest = ci; }
      });
      if (assignments[i] !== nearest) { assignments[i] = nearest; changed = true; }
    });

    if (!changed) break;

    // Update step – recompute centroids
    centroids = centroids.map((_, ci) => {
      const clusterPts = points.filter((_, i) => assignments[i] === ci);
      if (!clusterPts.length) return centroids[ci]; // keep old if empty
      return {
        lat: clusterPts.reduce((s, p) => s + p.lat, 0) / clusterPts.length,
        lng: clusterPts.reduce((s, p) => s + p.lng, 0) / clusterPts.length,
      };
    });
  }

  // Build result with metadata per cluster
  return centroids
    .map((centroid, ci) => {
      const clusterPts = points.filter((_, i) => assignments[i] === ci);
      if (!clusterPts.length) return null;

      // Category breakdown
      const categories = clusterPts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      // Dominant category
      const dominant = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Other';

      return {
        lat: centroid.lat,
        lng: centroid.lng,
        count: clusterPts.length,
        categories,
        dominant,
        issueIds: clusterPts.map(p => p._id),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count);
}

module.exports = { kMeans };

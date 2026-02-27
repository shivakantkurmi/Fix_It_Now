// src/components/ReportIssue.jsx — With AI Duplicate Detection + Priority Prediction
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, UploadCloud, X, AlertTriangle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from '../App';

// Simple debounce utility (inline, no extra package needed)
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const PRIORITY_STYLES = {
  High:   { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500'    },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  Low:    { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  dot: 'bg-green-500'  },
};

export default function ReportIssue({ user, setView, notify }) {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Pothole',
    location: { lat: 0, lng: 0, address: '' }, imageUrl: '', priority: 'Medium',
  });
  const [submitting, setSubmitting]     = useState(false);
  const [locating, setLocating]         = useState(false);
  const [preview, setPreview]           = useState(null);

  // Duplicate detection state
  const [duplicates, setDuplicates]     = useState([]);
  const [dupChecked, setDupChecked]     = useState(false);
  const [showDupPanel, setShowDupPanel] = useState(false);

  // Priority prediction state
  const [predictedPriority, setPredicted] = useState(null);
  const [priorityConf, setPriorityConf]   = useState(null);
  const [prioritySource, setPrioritySource] = useState(null);

  // ── Auto-predict priority (debounced) ──────────────────────────────────
  const predictPriority = useCallback(
    debounce(async (category, description) => {
      if (!description || description.length < 10) return;
      try {
        const res = await fetch(`${API_URL}/issues/predict-priority`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ category, description }),
        });
        if (res.ok) {
          const data = await res.json();
          setPredicted(data.priority);
          setPriorityConf(data.confidence);          setPrioritySource(data.source || 'heuristic');          setFormData(prev => ({ ...prev, priority: data.priority }));
        }
      } catch { /* silent */ }
    }, 800),
    [user.token]
  );

  // ── Check for duplicates ───────────────────────────────────────────────
  const checkDuplicates = async (description, lat, lng) => {
    if (!description || description.length < 15 || !lat || !lng) return;
    try {
      const res = await fetch(`${API_URL}/issues/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ description, lat, lng }),
      });
      if (res.ok) {
        const data = await res.json();
        setDuplicates(data.duplicates || []);
        setDupChecked(true);
        if (data.count > 0) setShowDupPanel(true);
      }
    } catch { /* silent */ }
  };

  // ── Field handlers ──────────────────────────────────────────────────────
  const handleDescChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, description: val }));
    predictPriority(formData.category, val);
    if (formData.location.lat && formData.location.lng) {
      checkDuplicates(val, formData.location.lat, formData.location.lng);
    }
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, category: val }));
    predictPriority(val, formData.description);
  };

  const handleLocation = () => {
    if (!navigator.geolocation) { notify('Geolocation not supported', 'error'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords: { latitude, longitude } }) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const d = await r.json();
        const address = d.display_name || `${latitude}, ${longitude}`;
        setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude, address } }));
        notify('Location captured successfully');
        checkDuplicates(formData.description, latitude, longitude);
      } catch {
        setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude, address: `${latitude}, ${longitude}` } }));
        notify('Coordinates captured');
      } finally { setLocating(false); }
    }, () => { notify('Location access denied', 'error'); setLocating(false); });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      setPreview(reader.result);
      notify('Image uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location.lat) { notify('Please capture location first', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        notify('Complaint created successfully');
        setView('dashboard');
      } else {
        const err = await res.json();
        notify(err.message || 'Failed to create complaint', 'error');
      }
    } catch { notify('Server error', 'error'); }
    finally { setSubmitting(false); }
  };

  const ps = predictedPriority ? PRIORITY_STYLES[predictedPriority] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 my-4 sm:my-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Report an Issue</h2>
        <button onClick={() => setView('dashboard')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {/* ── Duplicate Warning Banner ─────────────────────────────── */}
      <AnimatePresence>
        {dupChecked && duplicates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-5 rounded-xl border border-orange-300 bg-orange-50 overflow-hidden"
          >
            <button
              type="button"
              className="w-full px-4 py-3 flex items-center justify-between text-left"
              onClick={() => setShowDupPanel(p => !p)}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-600 flex-shrink-0" />
                <span className="text-sm font-bold text-orange-700">
                  {duplicates.length} similar issue{duplicates.length > 1 ? 's' : ''} already reported nearby
                </span>
              </div>
              {showDupPanel ? <ChevronUp size={16} className="text-orange-500" /> : <ChevronDown size={16} className="text-orange-500" />}
            </button>
            {showDupPanel && (
              <div className="px-4 pb-4 space-y-2 border-t border-orange-200 pt-3">
                <p className="text-xs text-orange-600 mb-2">Check if your issue is already tracked. You can still submit if it's different.</p>
                {duplicates.map(d => (
                  <div key={d._id} className="bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-sm font-semibold text-slate-800 truncate">{d.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{d.description}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{d.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{d.status}</span>
                      <span className="text-xs text-slate-400">{d.distanceM}m away • {d.similarity}% match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-sm sm:text-base"
            >
              <option>Pothole</option>
              <option>Garbage</option>
              <option>Street Light</option>
              <option>Water Leakage</option>
              <option>Electricity</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <button
              type="button" onClick={handleLocation} disabled={locating}
              className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base ${locating ? 'bg-gray-200 text-gray-500' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            >
              <Navigation size={18} />
              {locating ? 'Locating…' : 'Capture Location'}
            </button>
            {formData.location.address && <p className="mt-2 text-xs sm:text-sm text-gray-600 break-words">{formData.location.address}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text" value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-sm sm:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description} onChange={handleDescChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none h-28 sm:h-32 text-sm sm:text-base"
            required placeholder="Describe the issue in detail — the more specific, the better."
          />
        </div>

        {/* ── AI Priority Prediction Badge ───────────────────────── */}
        <AnimatePresence>
          {ps && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${ps.bg} ${ps.border}`}
            >
              <Zap size={18} className={ps.text} />
              <div className="flex-1">
                <p className={`text-sm font-bold ${ps.text}`}>AI Priority: {predictedPriority}</p>
                <p className={`text-xs ${ps.text} opacity-70`}>
                  {priorityConf} confidence •{' '}
                  {prioritySource === 'ml' ? '🤖 RandomForest ML' : '📏 Keyword heuristic'}
                </p>
              </div>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${ps.dot}`} />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (optional)</label>
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition">
            <UploadCloud size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Click to upload (max 15 MB)</span>
            <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
          </label>
          {preview && <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-48 object-contain mx-auto" />}
        </div>

        <div className="flex gap-3">
          {duplicates.length > 0 && (
            <button type="button" onClick={() => setView('dashboard')}
              className="flex-1 p-3 border-2 border-slate-200 text-slate-600 rounded-lg hover:border-slate-400 text-sm font-semibold transition"
            >
              Cancel
            </button>
          )}
          <button type="submit" disabled={submitting}
            className="flex-1 p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 text-sm sm:text-base font-semibold transition"
          >
            {submitting ? 'Submitting…' : duplicates.length > 0 ? 'Submit Anyway' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
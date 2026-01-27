// src/components/ReportIssue.jsx — RESPONSIVE
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, UploadCloud, X } from 'lucide-react';
import { API_URL } from '../App';

export default function ReportIssue({ user, setView, notify }) {
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Pothole', location: { lat: 0, lng: 0, address: '' }, imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleLocation = () => {
    if (!navigator.geolocation) { notify("Geolocation not supported", "error"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude, address: data.display_name || `${latitude}, ${longitude}` } }));
        notify('Location captured successfully');
      } catch (err) {
        setFormData(prev => ({ ...prev, location: { lat: latitude, lng: longitude, address: `${latitude}, ${longitude}` } }));
        notify('Coordinates captured');
      } finally { setLocating(false); }
    }, () => { notify("Location access denied", "error"); setLocating(false); });
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
    if (!formData.location.lat) { notify("Please capture location", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        notify('Complaint created successfully');
        setView('dashboard');
      } else {
        const err = await res.json();
        notify(err.message || 'Failed to create complaint', 'error');
      }
    } catch (error) {
      notify('Server error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-sm sm:text-base"
            >
              <option>Pothole</option>
              <option>Garbage</option>
              <option>Street Light</option>
              <option>Water Leakage</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <button 
              type="button" 
              onClick={handleLocation} 
              disabled={locating}
              className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base ${locating ? 'bg-gray-200' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            >
              <Navigation size={18} />
              {locating ? 'Locating...' : 'Capture Location'}
            </button>
            {formData.location.address && <p className="mt-2 text-xs sm:text-sm text-gray-600 break-words">{formData.location.address}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none text-sm sm:text-base"
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none h-28 sm:h-32 text-sm sm:text-base"
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (optional)</label>
          <input 
            type="file" 
            onChange={handleImageUpload} 
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
          />
          {preview && <img src={preview} alt="Preview" className="mt-4 rounded-lg max-h-48 object-contain mx-auto" />}
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full p-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 text-sm sm:text-base font-semibold"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </motion.div>
  );
}

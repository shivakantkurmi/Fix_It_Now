// src/components/InfoSchemes.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, ExternalLink, RefreshCw, Edit, Trash, 
  ChevronRight, PlusCircle, X, MapPin, Phone, Clock, 
  Database, ArrowLeft, Globe, ShieldCheck, ServerCrash
} from 'lucide-react';
import { API_URL } from '../App';

function InfoSchemes({ user, setView, notify }) {
  const [activeTab, setActiveTab] = useState('Scheme');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    type: 'Scheme', title: '', description: '', region: 'All',
    website: '', eligibility: '', benefits: '',
    contactInfo: '', address: '', operatingHours: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/info?type=${activeTab}`, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      if (res.ok) setSchemes(await res.json());
      else throw new Error(`Server responded with ${res.status}`);
    } catch (e) {
      setError(e.message);
      notify && notify('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const openForm = (scheme = null) => {
    if (scheme) {
      setEditingId(scheme._id);
      setFormData({ ...scheme });
    } else {
      setEditingId(null);
      setFormData({
        type: activeTab, title: '', description: '', region: 'All',
        website: '', eligibility: '', benefits: '',
        contactInfo: '', address: '', operatingHours: ''
      });
    }
    setShowForm(true);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-7xl min-h-screen">

      {/* HEADER */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0d1b3e] mb-3">
          Information Center
        </h2>
        <p className="text-sm sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Centralized database for Government Schemes & Public Facilities.
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-10">
        {['Scheme', 'Facility'].map(t => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setSelectedScheme(null); }}
            className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-lg transition shadow-md ${
              activeTab === t 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-slate-600'
            }`}
          >
            {t === 'Scheme' ? 'Govt Schemes' : 'Public Facilities'}
          </button>
        ))}
      </div>

      {/* ADD BUTTON */}
      {user?.role === 'admin' && !selectedScheme && !error && (
        <div className="text-center mb-6 sm:mb-10">
          <button
            onClick={() => openForm()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold flex items-center gap-2 mx-auto shadow-lg transition"
          >
            <PlusCircle size={20} /> Add New {activeTab}
          </button>
        </div>
      )}

      {/* STATES */}
      {loading ? (
        <div className="flex flex-col items-center py-16">
          <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-2xl">
          <ServerCrash size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : selectedScheme ? (
        <motion.div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedScheme(null)} className="mb-4 flex items-center gap-2 text-sm font-bold">
            <ArrowLeft size={18} /> Back
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {schemes.map(s => (
            <motion.div
              key={s._id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedScheme(s)}
              className="bg-white rounded-xl shadow-lg border p-5 cursor-pointer hover:shadow-xl transition"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {s.description}
              </p>
              <div className="flex justify-between items-center text-blue-700 text-sm font-bold">
                <span>View Details</span>
                <ChevronRight size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingId ? 'Edit' : 'Add'} {activeTab}</h3>
              <button onClick={() => setShowForm(false)}><X /></button>
            </div>
            <form className="p-4 space-y-3">
              <input className="w-full p-2 border rounded" placeholder="Title" />
              <textarea className="w-full p-2 border rounded" placeholder="Description" rows={3}></textarea>
              <button className="w-full bg-[#0d1b3e] text-white py-2 rounded font-bold">Save</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default InfoSchemes;

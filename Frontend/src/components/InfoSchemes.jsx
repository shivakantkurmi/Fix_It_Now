import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, ExternalLink, RefreshCw, Edit, Trash, 
  ChevronRight, PlusCircle, X, MapPin, Phone, Clock, 
  Database, ArrowLeft, Globe, ShieldCheck, AlertCircle, ServerCrash, Zap
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
    type: 'Scheme',
    title: '', description: '', region: 'All',
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
      if (res.ok) {
        setSchemes(await res.json());
      } else {
        throw new Error(`Server responded with ${res.status}`);
      }
    } catch (e) {
      const errorMessage = e.message === 'Failed to fetch'
        ? 'Cannot connect to server. Is the backend running on port 5000?'
        : e.message;
      setError(errorMessage);
      if (notify) notify('Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const openForm = (scheme = null) => {
    if (scheme) {
      setEditingId(scheme._id);
      setFormData({
        type: scheme.type,
        title: scheme.title,
        description: scheme.description,
        region: scheme.region || 'All',
        website: scheme.website || '',
        eligibility: scheme.eligibility || '',
        benefits: scheme.benefits || '',
        contactInfo: scheme.contactInfo || '',
        address: scheme.address || '',
        operatingHours: scheme.operatingHours || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        type: activeTab,
        title: '', description: '', region: 'All',
        website: '', eligibility: '', benefits: '',
        contactInfo: '', address: '', operatingHours: ''
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/info/${id}`, {
        method: 'DELETE',
        headers: { Authorization: user ? `Bearer ${user.token}` : '' }
      });
      if (res.ok) {
        if (notify) notify('Deleted successfully', 'success');
        fetchData();
        if (selectedScheme?._id === id) setSelectedScheme(null);
      }
    } catch (err) {
      if (notify) notify('Delete failed', 'error');
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 md:py-12 max-w-7xl min-h-screen">

      {/* HEADER SECTION */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#0d1b3e] mb-3 sm:mb-4">
          Information Center
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
          Centralized database for Government Schemes & Public Facilities.
        </p>

        <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <span className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 border shadow-sm ${error ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
            <Database size={16} />
            {error ? 'Database Disconnected' : 'Admin Managed Database'}
          </span>
        </div>

        <button 
          onClick={fetchData} 
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#0d1b3e] hover:bg-blue-900 text-white px-5 sm:px-8 py-2 sm:py-3 rounded-full font-bold shadow-xl transition-all active:scale-95 disabled:opacity-70"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Connecting...' : 'Refresh List'}
        </button>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-10">
        {['Scheme', 'Facility'].map(t => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setSelectedScheme(null); }}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full font-bold text-xs sm:text-sm md:text-lg transition-all shadow-md ${
              activeTab === t 
                ? 'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600' 
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t === 'Scheme' ? 'Govt Schemes' : 'Public Facilities'}
          </button>
        ))}
      </div>

      {/* ADMIN ADD BUTTON */}
      {user?.role === 'admin' && !selectedScheme && !error && (
        <div className="text-center mb-6 sm:mb-10">
          <button
            onClick={() => openForm()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold flex items-center gap-2 mx-auto shadow-lg transition-transform hover:-translate-y-1"
          >
            <PlusCircle size={20} /> Add New {activeTab}
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA - LOADING & ERROR */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500 font-medium text-sm sm:text-base">Accessing Database...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 sm:py-20 bg-red-50 rounded-3xl border border-red-100 max-w-3xl mx-auto">
          <ServerCrash size={48} className="mx-auto mb-4 sm:mb-6 text-red-500" />
          <h3 className="text-xl sm:text-2xl font-black text-red-800 mb-2 sm:mb-3">Connection Failed</h3>
          <p className="text-red-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : null}

      {/* DETAIL / EMPTY / GRID */}
      { !loading && !error && selectedScheme ? (

        /* --- DETAIL VIEW (Same Design + Swipe + Sticky Back) --- */
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, info) => {
            if (Math.abs(info.offset.x) > 120) setSelectedScheme(null);
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Sticky Back Bar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b px-4 py-3">
            <button 
              onClick={() => setSelectedScheme(null)} 
              className="flex items-center gap-2 text-slate-600 hover:text-[#0d1b3e] font-bold transition-colors text-sm sm:text-base"
            >
              <ArrowLeft size={20} /> Back to List
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 mt-4">
            {/* Detail Header */}
            <div className="bg-gradient-to-r from-[#0d1b3e] to-[#25356b] p-5 sm:p-8 text-white relative">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                    {selectedScheme.region === 'All' ? 'All India' : selectedScheme.region}
                  </span>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2">
                    {selectedScheme.title}
                  </h1>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs bg-green-500/20 px-2 py-0.5 rounded text-green-300 border border-green-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> ACTIVE
                    </span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button onClick={() => openForm(selectedScheme)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(selectedScheme._id)} className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition">
                      <Trash size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
              <p className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed mb-6 sm:mb-10 border-b border-slate-100 pb-6 sm:pb-8">
                {selectedScheme.description}
              </p>

              {activeTab === 'Scheme' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-blue-900 font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                      <ShieldCheck size={18} /> Eligibility
                    </h3>
                    <p className="text-slate-700 text-sm sm:text-base">
                      {selectedScheme.eligibility || 'No specific criteria mentioned.'}
                    </p>
                  </div>

                  <div className="bg-emerald-50 p-4 sm:p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-emerald-900 font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                      <PlusCircle size={18} /> Benefits
                    </h3>
                    <p className="text-slate-700 text-sm sm:text-base">
                      {selectedScheme.benefits || 'Check detailed documentation.'}
                    </p>
                  </div>

                  {selectedScheme.website && (
                    <div className="md:col-span-2 mt-4 text-center">
                      <a 
                        href={selectedScheme.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#0d1b3e] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg hover:bg-[#1a237e] transition shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        <Globe size={18} /> Visit Official Website <ExternalLink size={16} />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
                    <MapPin className="text-[#0d1b3e] mb-2 sm:mb-3" size={28} />
                    <h4 className="font-bold text-[#0d1b3e] mb-1">Address</h4>
                    <p className="text-slate-600 text-sm">{selectedScheme.address || 'Not available'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
                    <Phone className="text-green-600 mb-2 sm:mb-3" size={28} />
                    <h4 className="font-bold text-[#0d1b3e] mb-1">Contact</h4>
                    <p className="text-slate-600 text-sm">{selectedScheme.contactInfo || 'Not available'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
                    <Clock className="text-purple-600 mb-2 sm:mb-3" size={28} />
                    <h4 className="font-bold text-[#0d1b3e] mb-1">Hours</h4>
                    <p className="text-slate-600 text-sm">{selectedScheme.operatingHours || 'Not available'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      ) : !loading && !error && schemes.length === 0 ? (

        /* --- EMPTY STATE --- */
        <div className="text-center py-16 sm:py-20 text-slate-400">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg sm:text-xl font-semibold">No data found.</p>
          <p className="text-sm mt-2">
            {user?.role === 'admin' 
              ? `Add your first ${activeTab.toLowerCase()} to get started.` 
              : "Check back later for updates."}
          </p>
        </div>

      ) : !loading && !error ? (

        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {schemes.map((s) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedScheme(s)}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-full hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-[#0d1b3e] to-[#25356b] p-5 sm:p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                      <Home size={14} /> {s.region === 'All' ? 'All India' : s.region}
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openForm(s); }} className="p-1.5 bg-white/10 hover:bg-white/30 rounded-full"><Edit size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full"><Trash size={14} /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 flex-1 flex flex-col">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 line-clamp-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{s.description}</p>
                <div className="mt-auto flex items-center justify-between text-blue-700 font-bold text-sm">
                  <span>View Details</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      ) : null }

      {/* --- FORM MODAL (Full Screen on Mobile) --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
          <motion.div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl rounded-none sm:rounded-2xl shadow-2xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                {editingId ? 'Edit' : 'Add New'} {activeTab}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={22} />
              </button>
            </div>

            <form className="p-4 sm:p-6 space-y-4">
              {/* (Your existing form fields remain exactly the same here) */}
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default InfoSchemes;

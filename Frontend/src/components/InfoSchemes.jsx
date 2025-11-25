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

  // Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form Data State
  const [formData, setFormData] = useState({
    type: 'Scheme',
    title: '', description: '', region: 'All',
    website: '', eligibility: '', benefits: '',
    contactInfo: '', address: '', operatingHours: ''
  });

  // --- LOGIC: DATABASE FETCHING ---
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
      console.error("API Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // --- LOGIC: FORM HANDLERS ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/info/${editingId}` : `${API_URL}/info`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: user ? `Bearer ${user.token}` : ''
        },
        body: JSON.stringify({ ...formData, type: activeTab })
      });

      if (res.ok) {
        if (notify) notify(editingId ? 'Updated successfully!' : 'Added successfully!', 'success');
        setShowForm(false);
        fetchData();
      } else {
        if (notify) notify('Failed to save', 'error');
      }
    } catch (err) {
      if (notify) notify('Network error', 'error');
    }
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

  // --- RENDER ---
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-[#0d1b3e] mb-4">
          Information Center
        </h2>
        <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
          Centralized database for Government Schemes & Public Facilities.
        </p>
        
        {/* Status Badge */}
        <div className="flex justify-center items-center gap-3 mb-8">
          <span className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 border shadow-sm ${error ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
            <Database size={18} /> 
            {error ? 'Database Disconnected' : 'Admin Managed Database'}
          </span>
        </div>

        <button 
          onClick={fetchData} 
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#0d1b3e] hover:bg-blue-900 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all active:scale-95 disabled:opacity-70"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Connecting...' : 'Refresh List'}
        </button>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-10">
        {['Scheme', 'Facility'].map(t => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setSelectedScheme(null); }}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all shadow-md ${
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
        <div className="text-center mb-10">
          <button onClick={() => openForm()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 mx-auto shadow-lg transition-transform hover:-translate-y-1">
            <PlusCircle size={24} /> Add New {activeTab}
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw size={50} className="animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500 font-medium">Accessing Database...</p>
        </div>
      ) : error ? (
        /* --- ERROR STATE --- */
        <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100 max-w-3xl mx-auto">
          <ServerCrash size={60} className="mx-auto mb-6 text-red-500" />
          <h3 className="text-2xl font-black text-red-800 mb-3">Connection Failed</h3>
          <p className="text-red-600 mb-8 max-w-md mx-auto">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : selectedScheme ? (
        
        /* --- DETAIL VIEW --- */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedScheme(null)} 
            className="mb-6 flex items-center gap-2 text-slate-600 hover:text-[#0d1b3e] font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Back to List
          </button>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Detail Header */}
            <div className="bg-gradient-to-r from-[#0d1b3e] to-[#25356b] p-8 text-white relative">
               
               <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                      {selectedScheme.region === 'All' ? 'All India' : selectedScheme.region}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black mb-2">{selectedScheme.title}</h1>
                    
                    {/* ACTIVE BADGE (Detail View) */}
                    <div className="flex items-center gap-2 mt-2">
                       <span className="flex items-center gap-1 text-xs bg-green-500/20 px-2 py-0.5 rounded text-green-300 border border-green-500/30">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> ACTIVE
                       </span>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex gap-2">
                       <button onClick={() => openForm(selectedScheme)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition"><Edit size={20} /></button>
                       <button onClick={() => handleDelete(selectedScheme._id)} className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition"><Trash size={20} /></button>
                    </div>
                  )}
               </div>
            </div>

            {/* Detail Body */}
            <div className="p-8 md:p-10">
              <p className="text-xl text-slate-700 leading-relaxed mb-10 border-b border-slate-100 pb-8">
                {selectedScheme.description}
              </p>

              {activeTab === 'Scheme' ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-blue-900 font-bold text-lg mb-3 flex items-center gap-2">
                      <ShieldCheck size={20} /> Eligibility
                    </h3>
                    <p className="text-slate-700">{selectedScheme.eligibility || 'No specific criteria mentioned.'}</p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-emerald-900 font-bold text-lg mb-3 flex items-center gap-2">
                      <PlusCircle size={20} /> Benefits
                    </h3>
                    <p className="text-slate-700">{selectedScheme.benefits || 'Check detailed documentation.'}</p>
                  </div>
                  
                  {selectedScheme.website && (
                    <div className="md:col-span-2 mt-4 text-center">
                      <a 
                        href={selectedScheme.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#0d1b3e] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1a237e] transition shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                         <Globe size={20} /> Visit Official Website <ExternalLink size={18} />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <MapPin className="text-[#0d1b3e] mb-3" size={32} />
                    <h4 className="font-bold text-[#0d1b3e] mb-1">Address</h4>
                    <p className="text-slate-600 text-sm">{selectedScheme.address || 'Not available'}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <Phone className="text-green-600 mb-3" size={32} />
                    <h4 className="font-bold text-[#0d1b3e] mb-1">Contact</h4>
                    <p className="text-slate-600 text-sm">{selectedScheme.contactInfo || 'Not available'}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <Clock className="text-purple-600 mb-3" size={32} />
                    <h4 className="font-bold text-[#0d1b3e] mb-1">Hours</h4>
                    <p className="text-slate-600 text-sm">{selectedScheme.operatingHours || 'Not available'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      ) : schemes.length === 0 ? (
        /* --- EMPTY STATE --- */
        <div className="text-center py-20 text-slate-400">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold">No data found.</p>
          <p className="text-sm mt-2">
            {user?.role === 'admin' 
              ? `Add your first ${activeTab.toLowerCase()} to get started.` 
              : "Check back later for updates."}
          </p>
        </div>
      ) : (
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((s) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedScheme(s)}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-full hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-[#0d1b3e] to-[#25356b] p-6 text-white relative overflow-hidden">
                
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Home size={16} className="opacity-70" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                          {s.region === 'All' ? 'All India' : s.region}
                        </span>
                      </div>
                      
                      {/* Corner Active Badge (Inline Style) */}
                      <div className="flex items-center gap-2">
                         <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 border border-emerald-500/30 font-bold">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE
                         </span>
                      </div>
                    </div>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button onClick={(e) => { e.stopPropagation(); openForm(s); }} className="p-1.5 bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full transition"><Edit size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="p-1.5 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-full transition"><Trash size={14} /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight line-clamp-2" title={s.title}>
                  {s.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                  {s.description}
                </p>
                
                <div className="mt-auto flex items-center justify-between text-blue-700 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- FORM MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit' : 'Add New'} {activeTab}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                <textarea required placeholder="Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="p-3 border rounded-xl">
                    <option value="All">All India</option>
                    <option value="Rural">Rural Only</option>
                    <option value="Urban">Urban Only</option>
                  </select>
                  {activeTab === 'Scheme' && (
                    <input type="url" placeholder="Official Website URL" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="p-3 border rounded-xl" />
                  )}
                </div>

                {activeTab === 'Scheme' ? (
                  <>
                    <input placeholder="Eligibility Criteria" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} className="w-full p-3 border rounded-xl" />
                    <textarea placeholder="Benefits / Financial Aid" rows={2} value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} className="w-full p-3 border rounded-xl" />
                  </>
                ) : (
                  <>
                     <input placeholder="Facility Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-xl" />
                     <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Contact Info" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} className="p-3 border rounded-xl" />
                        <input placeholder="Operating Hours" value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} className="p-3 border rounded-xl" />
                     </div>
                  </>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-white bg-[#0d1b3e] hover:bg-blue-900 rounded-xl font-bold">Save Details</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default InfoSchemes;
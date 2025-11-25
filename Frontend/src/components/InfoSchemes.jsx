// src/components/InfoSchemes.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, PlusCircle, Edit, Trash, X } from 'lucide-react';
import { API_URL } from '../App';

function InfoSchemes({ user, setView, notify }) {
  const [activeTab, setActiveTab] = useState('Scheme');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eligibility: '',
    benefits: '',
    applicationProcess: '',
    requiredDocuments: '',
    contactInfo: '',
    address: '',
    operatingHours: '',
    region: 'All'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/info?type=${activeTab}`, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSchemes(data);
      } else {
        notify('Failed to load info', 'error');
      }
    } catch (e) { 
      notify('Connection failed', 'error'); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/info/${editId}` : `${API_URL}/info`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ ...formData, type: activeTab })
      });
      if (res.ok) { 
        notify(editId ? 'Updated successfully' : 'Added successfully'); 
        setIsFormOpen(false);
        setEditId(null);
        fetchData(); 
      } else { notify('Error saving info', 'error'); }
    } catch (e) { notify('Connection error', 'error'); }
  };

  const handleEdit = (scheme) => {
    setFormData(scheme);
    setEditId(scheme._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`${API_URL}/info/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) { notify('Deleted successfully'); fetchData(); }
      else { notify('Error deleting', 'error'); }
    } catch (e) { notify('Connection error', 'error'); }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h2 className="text-3xl font-black text-[#0d1b3e] mb-2">Information Center</h2>
        <p className="text-slate-500">Latest government initiatives and utility information.</p>
      </motion.div>

      <div className="flex justify-center gap-4 mb-10">
        {['Scheme', 'Facility'].map(t => (
          <motion.button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            whileHover={{ scale: 1.05 }}
            className={`px-8 py-3 rounded-full font-bold text-lg transition shadow-sm ${activeTab === t ? 'bg-[#0d1b3e] text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            {t === 'Scheme' ? 'Govt Schemes' : 'Public Facilities'}
          </motion.button>
        ))}
      </div>

      {user?.role === 'admin' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
          <button onClick={() => { setIsFormOpen(true); setEditId(null); setFormData({ title: '', description: '', eligibility: '', benefits: '', applicationProcess: '', requiredDocuments: '', contactInfo: '', address: '', operatingHours: '', region: 'All' }); }} className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
            <PlusCircle size={18}/> Add New {activeTab}
          </button>
        </motion.div>
      )}

      {loading ? <div className="text-center py-20 text-slate-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((s, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition group relative"
            >
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-[#0d1b3e] group-hover:text-white transition">
                <Home size={24}/>
              </div>
              <h3 className="font-bold text-xl text-slate-800 mb-2">{s.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{s.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Active</span>
              </div>
              {user?.role === 'admin' && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(s)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200"><Edit size={16} className="text-blue-600"/></button>
                  <button onClick={() => handleDelete(s._id)} className="p-2 bg-red-100 rounded-full hover:bg-red-200"><Trash size={16} className="text-red-600"/></button>
                </div>
              )}
            </motion.div>
          ))}
          {schemes.length === 0 && <div className="col-span-full text-center text-slate-400 py-12">No information found. Admins can add new entries here.</div>}
        </div>
      )}

      {isFormOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-red-100 hover:text-red-600 transition z-20 shadow-sm">
              <X size={24} />
            </button>
            
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">{editId ? 'Edit' : 'Add'} {activeTab}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input className="w-full p-3 border rounded" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required />
                <textarea className="w-full p-3 border rounded h-24" placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} required />
                {activeTab === 'Scheme' && (
                  <>
                    <input className="w-full p-3 border rounded" placeholder="Eligibility" value={formData.eligibility} onChange={e=>setFormData({...formData, eligibility: e.target.value})} />
                    <input className="w-full p-3 border rounded" placeholder="Benefits" value={formData.benefits} onChange={e=>setFormData({...formData, benefits: e.target.value})} />
                  </>
                )}
                {activeTab === 'Facility' && (
                  <>
                    <input className="w-full p-3 border rounded" placeholder="Contact Info" value={formData.contactInfo} onChange={e=>setFormData({...formData, contactInfo: e.target.value})} />
                    <input className="w-full p-3 border rounded" placeholder="Address" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} />
                    <input className="w-full p-3 border rounded" placeholder="Operating Hours" value={formData.operatingHours} onChange={e=>setFormData({...formData, operatingHours: e.target.value})} />
                  </>
                )}
                <select className="w-full p-3 border rounded" value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})}>
                  <option>All</option><option>Rural</option><option>Urban</option>
                </select>
                <button className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">Save</button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default InfoSchemes;
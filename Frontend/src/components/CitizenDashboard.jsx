// src/components/CitizenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IssueCard from './IssueCard';
import { PlusCircle } from 'lucide-react';
import { API_URL } from '../App';

function CitizenDashboard({ user, setView, notify }) {
  const [issues, setIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        const res = await fetch(`${API_URL}/issues`, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        if (res.ok) setIssues(data.issues || []);
      } catch (err) { notify('Failed to load issues', 'error'); }
    };

    const fetchMyIssues = async () => {
      try {
        const res = await fetch(`${API_URL}/issues/my`, { headers: { Authorization: `Bearer ${user.token}` } });
        const data = await res.json();
        if (res.ok) setMyIssues(data || []);
      } catch (err) { notify('Failed to load my issues', 'error'); }
    };

    Promise.all([fetchAllIssues(), fetchMyIssues()]).finally(() => setLoading(false));
  }, [user.token]);

  const displayedIssues = activeTab === 'all' ? issues : myIssues;

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
      >
        <div>
          <h2 className="text-3xl font-black text-[#0d1b3e] mb-2">Community Reports</h2>
          <p className="text-slate-500">View reported issues, track status, or raise a new complaint.</p>
        </div>
        <button onClick={() => setView('report')} className="bg-[#0d1b3e] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#1a237e] transition flex items-center gap-2 transform hover:-translate-y-1">
            <PlusCircle size={20} /> Lodge Complaint
        </button>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('all')} className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border-2 ${activeTab === 'all' ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'}`}>
          All Complaints
        </button>
        <button onClick={() => setActiveTab('my')} className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border-2 ${activeTab === 'my' ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'}`}>
          My Complaints
        </button>
      </div>

      {loading ? <div className="text-center py-20 text-slate-400">Loading data...</div> : (
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayedIssues.map(issue => <IssueCard key={issue._id} issue={issue} user={user} notify={notify} refresh={() => {}} />)}
          {displayedIssues.length === 0 && <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">No complaints found.</div>}
        </motion.div>
      )}
    </div>
  );
}

export default CitizenDashboard;
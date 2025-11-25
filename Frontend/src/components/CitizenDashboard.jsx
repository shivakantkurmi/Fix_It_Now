// src/components/CitizenDashboard.jsx — AUTO REFRESH AFTER DELETE & CHANGES
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

  // REUSABLE REFRESH FUNCTION — CALL THIS AFTER ANY CHANGE
  const refreshIssues = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };

      const [allRes, myRes] = await Promise.all([
        fetch(`${API_URL}/issues`, { headers }),
        fetch(`${API_URL}/issues/my`, { headers })
      ]);

      if (allRes.ok) {
        const data = await allRes.json();
        setIssues(data.issues || []);
      }
      if (myRes.ok) {
        const data = await myRes.json();
        setMyIssues(data || []);
      }
    } catch (err) {
      notify('Failed to refresh', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshIssues();
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
        <button 
          onClick={() => setView('report')} 
          className="bg-[#0d1b3e] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#1a237e] transition flex items-center gap-2 transform hover:-translate-y-1"
        >
          <PlusCircle size={20} /> Lodge Complaint
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border-2 ${
            activeTab === 'all' 
              ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'
          }`}
        >
          All Complaints
        </button>
        <button 
          onClick={() => setActiveTab('my')} 
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border-2 ${
            activeTab === 'my' 
              ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'
          }`}
        >
          My Complaints ({myIssues.length})
        </button>
      </div>

      {/* Loading & Issues List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0d1b3e] border-t-transparent"></div>
          <p className="mt-4 text-slate-500">Loading complaints...</p>
        </div>
      ) : displayedIssues.length === 0 ? (
        <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
          {activeTab === 'my' ? 'You have not lodged any complaints yet.' : 'No complaints reported in your area.'}
        </div>
      ) : (
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayedIssues.map(issue => (
            <motion.div
              key={issue._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* PASS refresh FUNCTION */}
              <IssueCard 
                issue={issue} 
                user={user} 
                notify={notify} 
                refresh={refreshIssues}   // THIS MAKES IT LIVE!
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default CitizenDashboard;
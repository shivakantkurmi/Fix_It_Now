// src/components/CitizenDashboard.jsx — AUTO REFRESH AFTER DELETE & CHANGES + PAGINATION
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    refreshIssues();
  }, [user.token]);

  useEffect(() => {
    setCurrentPage(1); // reset page when tab changes
  }, [activeTab]);

  const displayedIssues = activeTab === 'all' ? issues : myIssues;

  // Pagination logic
  const totalPages = Math.ceil(displayedIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIssues = displayedIssues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-8 sm:space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between md:items-end gap-4 sm:gap-6 bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-slate-100"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1b3e] mb-2">
            Community Reports
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            View reported issues, track status, or raise a new complaint.
          </p>
        </div>
        <button 
          onClick={() => setView('report')} 
          className="bg-[#0d1b3e] text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-lg hover:bg-[#1a237e] transition flex items-center justify-center gap-2 transform hover:-translate-y-1 text-sm sm:text-base"
        >
          <PlusCircle size={18} className="sm:size-5" /> Lodge Complaint
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('all')} 
          className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition border-2 ${
            activeTab === 'all' 
              ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'
          }`}
        >
          All Complaints
        </button>
        <button 
          onClick={() => setActiveTab('my')} 
          className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition border-2 ${
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
        <div className="text-center py-12 sm:py-20">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#0d1b3e] border-t-transparent"></div>
          <p className="mt-4 text-slate-500 text-sm sm:text-base">Loading complaints...</p>
        </div>
      ) : currentIssues.length === 0 ? (
        <div className="col-span-full text-center py-12 sm:py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium text-sm sm:text-base">
          {activeTab === 'my' ? 'You have not lodged any complaints yet.' : 'No complaints reported in your area.'}
        </div>
      ) : (
        <>
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
          >
            {currentIssues.map(issue => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <IssueCard 
                  issue={issue} 
                  user={user} 
                  notify={notify} 
                  refresh={refreshIssues}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                    currentPage === i + 1
                      ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CitizenDashboard;

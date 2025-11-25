// src/components/AdminDashboard.jsx — AUTO REFRESH WORKING 100%
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IssueCard from './IssueCard';
import { FileText } from 'lucide-react';
import { API_URL } from '../App';

function AdminDashboard({ user, setView, notify }) {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // REUSABLE FUNCTION TO FETCH DATA
  const fetchData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [iRes, sRes] = await Promise.all([
        fetch(`${API_URL}/issues`, { headers }),
        fetch(`${API_URL}/analytics/dashboard`, { headers })
      ]);

      if (iRes.ok) {
        const data = await iRes.json();
        setIssues(data.issues || []);
      }
      if (sRes.ok) {
        const data = await sRes.json();
        setStats(data);
      }
    } catch (e) {
      notify('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchData();
  }, [user.token]);

  // PASS THIS REFRESH FUNCTION TO IssueCard
  const handleIssueUpdate = () => {
    fetchData(); // This will instantly refresh all cards + stats
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-[#0d1b3e]">Admin Portal</h2>
        <div className="text-right">
          <p className="font-bold text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500 uppercase">Authority Level 1</p>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="text-4xl font-black mb-1">{stats.totalIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Total Reports</div>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="text-4xl font-black mb-1">{stats.resolvedIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Resolved</div>
          </div>
          <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="text-4xl font-black mb-1">{stats.pendingIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Pending</div>
          </div>
          <div className="bg-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="text-3xl font-black mb-1">{stats.avgResolutionTime}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Avg Resolution</div>
          </div>
        </motion.div>
      )}

      {/* Recent Grievances */}
      <div>
        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
          <FileText /> Recent Grievances
        </h3>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0d1b3e] border-t-transparent"></div>
          </div>
        ) : issues.length === 0 ? (
          <p className="text-center text-slate-500 py-20">No issues reported yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue, index) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* PASS refresh function */}
                <IssueCard
                  issue={issue}
                  user={user}
                  isAdmin={true}
                  notify={notify}
                  refresh={handleIssueUpdate}  // THIS IS THE KEY!
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
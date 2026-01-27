import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IssueCard from './IssueCard';
import { FileText } from 'lucide-react';
import { API_URL } from '../App';

function AdminDashboard({ user, setView, notify }) {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [user.token]);

  const handleIssueUpdate = () => {
    fetchData();
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-8 sm:space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-[#0d1b3e]">Admin Portal</h2>
        <div className="text-left sm:text-right">
          <p className="font-bold text-slate-800 text-sm sm:text-base">{user.name}</p>
          <p className="text-xs text-slate-500 uppercase">Authority Level 1</p>
        </div>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{stats.totalIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Total Reports</div>
          </div>
          <div className="bg-green-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{stats.resolvedIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Resolved</div>
          </div>
          <div className="bg-orange-500 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{stats.pendingIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Pending</div>
          </div>
          <div className="bg-purple-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-xl sm:text-3xl font-black mb-1">{stats.avgResolutionTime}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Avg Resolution</div>
          </div>
        </motion.div>
      )}

      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 sm:mb-6 flex items-center gap-2">
          <FileText /> Recent Grievances
        </h3>

        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#0d1b3e] border-t-transparent"></div>
          </div>
        ) : issues.length === 0 ? (
          <p className="text-center text-slate-500 py-12 sm:py-20 text-sm sm:text-base">
            No issues reported yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {issues.map((issue, index) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <IssueCard
                  issue={issue}
                  user={user}
                  isAdmin={true}
                  notify={notify}
                  refresh={handleIssueUpdate}
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

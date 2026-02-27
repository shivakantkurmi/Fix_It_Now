import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, FileText, BarChart2, ShieldCheck, Mail } from 'lucide-react';
import IssueCard from './IssueCard';
import { API_URL } from '../App';

function StarRating({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-xs font-bold text-slate-400 italic">Not yet rated</span>;
  }
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-600">{value.toFixed(1)}</span>
    </div>
  );
}

function SuperAdminDashboard({ user, setView, notify }) {
  const [activeTab, setActiveTab] = useState('ratings');
  const [adminRatings, setAdminRatings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const headers = { Authorization: `Bearer ${user.token}` };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ratingsRes, issuesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/superadmin/admin-ratings`, { headers }),
        fetch(`${API_URL}/superadmin/issues`, { headers }),
        fetch(`${API_URL}/analytics/dashboard`, { headers }),
      ]);

      if (ratingsRes.ok) setAdminRatings(await ratingsRes.json());
      if (issuesRes.ok) setIssues(await issuesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      notify('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const totalPages = Math.ceil(issues.length / itemsPerPage);
  const currentIssues = issues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tabs = [
    { id: 'ratings', label: 'Admin Ratings', icon: <Star size={15} /> },
    { id: 'issues',  label: 'All Issues',    icon: <FileText size={15} /> },
    { id: 'stats',   label: 'Platform Stats', icon: <BarChart2 size={15} /> },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-[#0d1b3e] to-indigo-700 text-white p-6 sm:p-8 rounded-2xl shadow-xl"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck size={36} className="text-yellow-400" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">Super Admin Panel</h2>
            <p className="text-indigo-200 text-sm">Top-Level Authority Dashboard</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-bold text-sm">{user.name}</p>
          <p className="text-xs text-yellow-300 uppercase font-bold">Authority Level MAX</p>
        </div>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Issues',   value: stats.totalIssues,    bg: 'bg-blue-600' },
            { label: 'Resolved',       value: stats.resolvedIssues, bg: 'bg-green-600' },
            { label: 'Pending',        value: stats.pendingIssues,  bg: 'bg-orange-500' },
            { label: 'Avg Resolution', value: stats.avgResolutionTime, bg: 'bg-purple-600' },
          ].map(({ label, value, bg }) => (
            <div key={label} className={`${bg} text-white p-4 sm:p-6 rounded-2xl shadow-lg`}>
              <div className="text-xl sm:text-3xl font-black mb-1">{value}</div>
              <div className="text-xs uppercase opacity-80 font-bold">{label}</div>
            </div>
          ))}
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition border-2 ${
              activeTab === tab.id
                ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]'
                : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0d1b3e] border-t-transparent" />
        </div>
      ) : (
        <>
          {activeTab === 'ratings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-700">Admin Performance</h3>
                <span className="text-sm text-slate-400">({adminRatings.length} admin{adminRatings.length !== 1 ? 's' : ''})</span>
              </div>

              {adminRatings.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center text-slate-400 shadow">
                  No admin accounts found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminRatings.map((admin, i) => (
                    <motion.div
                      key={admin._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-slate-100 hover:shadow-xl transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-lg">
                            {admin.name?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{admin.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail size={11} /> {admin.email}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' :
                          i === 1 ? 'bg-gray-100 text-gray-600' :
                          i === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          #{i + 1}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Avg. Rating</span>
                          <StarRating value={admin.avgRating} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Total Resolved</span>
                          <span className={`text-sm font-bold ${admin.totalResolved > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            {admin.totalResolved > 0 ? admin.totalResolved : 'None yet'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">Rated By Citizens</span>
                          <span className={`text-sm font-bold ${admin.ratedCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                            {admin.ratedCount > 0 ? admin.ratedCount : '—'}
                          </span>
                        </div>
                      </div>

                      {admin.avgRating !== null ? (
                        <div className="mt-4 bg-slate-50 rounded-xl p-3">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${(admin.avgRating / 5) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1 text-right">{((admin.avgRating / 5) * 100).toFixed(0)}% satisfaction</p>
                        </div>
                      ) : (
                        <div className="mt-4 bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 italic">No citizen feedback yet</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'issues' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-700">All Issues</h3>
                <span className="text-sm text-slate-400">({issues.length} total)</span>
              </div>

              {currentIssues.length === 0 ? (
                <p className="text-center text-slate-500 py-20">No issues found.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                    {currentIssues.map((issue, i) => (
                      <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <IssueCard
                          issue={issue}
                          user={user}
                          isAdmin={true}
                          notify={notify}
                          refresh={fetchAll}
                        />
                      </motion.div>
                    ))}
                  </div>

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
            </motion.div>
          )}

          {activeTab === 'stats' && stats && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white rounded-2xl shadow p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-indigo-600" />
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stats.categoryStats?.map(c => (
                    <div key={c._id} className="bg-indigo-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-black text-indigo-700">{c.count}</div>
                      <div className="text-xs font-bold text-slate-500 mt-1">{c._id}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Resolution Efficiency</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-green-600">{stats.avgResolutionTime}</div>
                  <div className="text-sm text-slate-500">average time from report to resolution</div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default SuperAdminDashboard;

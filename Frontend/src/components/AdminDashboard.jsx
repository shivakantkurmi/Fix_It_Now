import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IssueCard from './IssueCard';
import HotspotMap from './HotspotMap';
import { FileText, Map, AlertTriangle, Filter } from 'lucide-react';
import { API_URL } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

function AdminDashboard({ user, setView, notify }) {
  const { t } = useLanguage();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Priority counts for stats
  const highCount   = issues.filter(i => i.priority === 'High').length;
  const mediumCount = issues.filter(i => i.priority === 'Medium').length;
  const lowCount    = issues.filter(i => i.priority === 'Low').length;

  // Filter + pagination
  const filteredIssues = priorityFilter === 'All'
    ? issues
    : issues.filter(i => i.priority === priorityFilter);

  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIssues = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-8 sm:space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <h2 className="text-2xl sm:text-3xl font-black text-[#0d1b3e]">{t('admin_title')}</h2>
        <div className="text-left sm:text-right">
          <p className="font-bold text-slate-800 text-sm sm:text-base">{user.name}</p>
          <p className="text-xs text-slate-500 uppercase">Authority Level 1</p>
        </div>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6"
        >
          <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{stats.totalIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">{t('dashboard_total')}</div>
          </div>
          <div className="bg-green-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{stats.resolvedIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">{t('dashboard_resolved')}</div>
          </div>
          <div className="bg-orange-500 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{stats.pendingIssues}</div>
            <div className="text-xs uppercase opacity-80 font-bold">{t('dashboard_pending')}</div>
          </div>
          <div className="bg-red-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <div className="text-2xl sm:text-4xl font-black mb-1">{highCount}</div>
            <div className="text-xs uppercase opacity-80 font-bold">{t('admin_high_priority')}</div>
          </div>
          <div className="bg-purple-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-3xl font-black mb-1">{stats.avgResolutionTime}</div>
            <div className="text-xs uppercase opacity-80 font-bold">Avg Resolution</div>
          </div>
        </motion.div>
      )}

      <div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => { setActiveTab('issues'); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition border-2 ${activeTab === 'issues' ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'}`}
          >
            <FileText size={15} /> {t('admin_grievances')}
          </button>
          <button
            onClick={() => setActiveTab('hotspots')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition border-2 ${activeTab === 'hotspots' ? 'bg-[#0d1b3e] text-white border-[#0d1b3e]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#0d1b3e]'}`}
          >
            <Map size={15} /> {t('admin_hotspot')}
          </button>
        </div>

        {/* Priority Filter (only on issues tab) */}
        {activeTab === 'issues' && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Filter size={15} className="text-slate-400" />
            {[
              { label: t('admin_filter_all'),   value: 'All',    cls: 'bg-slate-100 text-slate-700 border-slate-300' },
              { label: t('admin_filter_high'),   value: 'High',   cls: 'bg-red-50 text-red-700 border-red-300' },
              { label: t('admin_filter_medium'), value: 'Medium', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
              { label: t('admin_filter_low'),    value: 'Low',    cls: 'bg-green-50 text-green-700 border-green-300' },
            ].map(({ label, value, cls }) => (
              <button
                key={value}
                onClick={() => { setPriorityFilter(value); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                  priorityFilter === value
                    ? 'ring-2 ring-offset-1 ring-indigo-400 ' + cls
                    : cls + ' opacity-60 hover:opacity-100'
                }`}
              >
                {label}
                {value !== 'All' && (
                  <span className="ml-1 opacity-70">
                    ({value === 'High' ? highCount : value === 'Medium' ? mediumCount : lowCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'hotspots' ? (
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <HotspotMap user={user} notify={notify} />
          </div>
        ) : (
          <>
            <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 sm:mb-6 flex items-center gap-2">
              <FileText /> {t('admin_grievances')}
              {priorityFilter !== 'All' && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  — {filteredIssues.length} result{filteredIssues.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>

        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#0d1b3e] border-t-transparent"></div>
          </div>
        ) : currentIssues.length === 0 ? (
          <p className="text-center text-slate-500 py-12 sm:py-20 text-sm sm:text-base">
            {priorityFilter !== 'All' ? `No ${priorityFilter} priority issues.` : t('no_issues')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {currentIssues.map((issue, index) => (
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

            {/* Pagination */}
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
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

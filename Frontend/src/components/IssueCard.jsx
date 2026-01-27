// src/components/IssueCard.jsx — RESPONSIVE FINAL
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, X, Trash2, Clock, CheckCircle, User, Phone, Mail } from 'lucide-react';
import { API_URL } from '../App';

function IssueCard({ issue, user, isAdmin = false, notify, refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isOwner = user && issue.user && user._id === issue.user._id;

  const updateStatus = async (newStatus) => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/issues/${issue._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        notify(`Status updated to ${newStatus}`, 'success');
        refresh && refresh();
        setShowModal(false);
      } else notify('Failed to update status', 'error');
    } catch { notify('Network error', 'error'); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this complaint permanently?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/issues/${issue._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        notify('Complaint deleted', 'success');
        setShowModal(false);
        refresh && refresh();
      } else notify('Delete failed', 'error');
    } catch { notify('Network error', 'error'); }
    finally { setDeleting(false); }
  };

  const statusColor = {
    Pending: 'bg-red-100 text-red-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    Resolved: 'bg-green-100 text-green-700',
  }[issue.status] || 'bg-gray-100 text-gray-700';

  return (
    <>
      {/* CARD */}
      <motion.div
        onClick={() => setShowModal(true)}
        whileHover={{ y: -6, scale: 1.01 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition cursor-pointer border overflow-hidden"
      >
        <div className="h-40 sm:h-56 relative">
          {issue.imageUrl ? (
            <img src={issue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Camera size={48} className="text-gray-400" />
            </div>
          )}
          <div className={`absolute top-3 right-3 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm ${statusColor}`}>
            {issue.status}
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div className="flex justify-between mb-3">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold">
              {issue.category}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              {new Date(issue.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold text-slate-800 mb-2 line-clamp-2">
            {issue.title}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 line-clamp-3 mb-4">
            {issue.description}
          </p>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <User size={16} />
            <span className="font-medium">By: {issue.user?.name || 'Citizen'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
            <MapPin size={14} className="text-indigo-600" />
            <span>{issue.location?.address || 'Location captured'}</span>
          </div>
        </div>
      </motion.div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-red-100"
            >
              <X size={22} className="text-red-600" />
            </button>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-10 p-5 sm:p-10">
              <div>
                {issue.imageUrl ? (
                  <img src={issue.imageUrl} alt="Issue" className="w-full rounded-xl sm:rounded-3xl" />
                ) : (
                  <div className="bg-gray-200 h-64 sm:h-96 rounded-xl sm:rounded-3xl flex items-center justify-center">
                    <Camera size={72} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="space-y-5 sm:space-y-8">
                <span className={`px-4 py-2 rounded-full font-bold ${statusColor}`}>
                  {issue.status}
                </span>

                <h2 className="text-2xl sm:text-4xl font-black">{issue.title}</h2>
                <p className="text-lg sm:text-xl font-bold text-indigo-600">{issue.category}</p>

                <div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
                  <h4 className="font-bold mb-2">Reported By</h4>
                  <p className="flex items-center gap-2 text-sm"><User size={16} /> {issue.user?.name}</p>
                  {isAdmin && issue.user?.phone && <p className="flex items-center gap-2 text-sm"><Phone size={16} /> {issue.user.phone}</p>}
                  {isAdmin && issue.user?.email && <p className="flex items-center gap-2 text-sm"><Mail size={16} /> {issue.user.email}</p>}
                </div>

                <p className="text-sm sm:text-base text-slate-700">{issue.description}</p>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={18} className="text-indigo-600" />
                  <span>{issue.location?.address || 'GPS location captured'}</span>
                </div>

                {isAdmin && issue.status !== 'Resolved' && (
                  <div className="flex gap-3">
                    {issue.status === 'Pending' && (
                      <button onClick={() => updateStatus('In Progress')} className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <Clock size={18} /> Start
                      </button>
                    )}
                    {issue.status === 'In Progress' && (
                      <button onClick={() => updateStatus('Resolved')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Resolve
                      </button>
                    )}
                  </div>
                )}

                {!isAdmin && isOwner && issue.status !== 'Resolved' && (
                  <button onClick={handleDelete} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Delete Complaint
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default IssueCard;

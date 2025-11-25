// src/components/IssueCard.jsx — FINAL & FULLY WORKING
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, X, Trash2, Clock, CheckCircle, User, Phone, Mail } from 'lucide-react';
import { API_URL } from '../App';

function IssueCard({ issue, user, isAdmin = false, notify, refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isOwner = user && issue.user && user._id === issue.user._id;

  // ADMIN: Change Status
  const updateStatus = async (newStatus) => {
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/issues/${issue._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        notify(`Status updated to ${newStatus}`, 'success');
        if (refresh) refresh();
        setShowModal(false);
      } else {
        notify('Failed to update status', 'error');
      }
    } catch (err) {
      notify('Network error', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // CITIZEN: Delete own complaint
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
        if (refresh) refresh();
      } else {
        notify('Delete failed', 'error');
      }
    } catch {
      notify('Network error', 'error');
    } finally {
      setDeleting(false);
    }
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
        whileHover={{ y: -10, scale: 1.02 }}
        className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-slate-200 overflow-hidden"
      >
        <div className="h-56 relative">
          {issue.imageUrl ? (
            <img src={issue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Camera size={60} className="text-gray-400" />
            </div>
          )}
          <div className={`absolute top-4 right-4 px-5 py-2 rounded-full font-bold text-sm ${statusColor}`}>
            {issue.status}
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
              {issue.category}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(issue.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-3 line-clamp-2">{issue.title}</h3>
          <p className="text-slate-600 text-base line-clamp-3 mb-6">{issue.description}</p>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <User size={18} />
            <span className="font-medium">By: {issue.user?.name || 'Citizen'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
            <MapPin size={16} className="text-indigo-600" />
            <span>{issue.location?.address || 'Location captured'}</span>
          </div>
        </div>
      </motion.div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-red-100 transition"
            >
              <X size={32} className="text-red-600" />
            </button>

            <div className="grid md:grid-cols-2 gap-10 p-10">
              {/* Image */}
              <div>
                {issue.imageUrl ? (
                  <img src={issue.imageUrl} alt="Issue" className="w-full rounded-3xl shadow-lg" />
                ) : (
                  <div className="bg-gray-200 h-96 rounded-3xl flex items-center justify-center">
                    <Camera size={100} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-8">
                <div>
                  <span className={`px-6 py-3 rounded-full font-bold text-lg ${statusColor}`}>
                    {issue.status}
                  </span>
                  <h2 className="text-5xl font-black text-slate-800 mt-6">{issue.title}</h2>
                  <p className="text-2xl font-bold text-indigo-600 mt-3">{issue.category}</p>
                </div>

                {/* Reporter Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200">
                  <h3 className="text-mb-2 text-2xl font-black text-[#0d1b3e] mb-6">Reported By</h3>
                  <div className="space-y-4 text-lg">
                    <div className="flex items-center gap-4">
                      <User size={28} className="text-blue-700" />
                      <span className="font-bold">{issue.user?.name || 'Anonymous'}</span>
                    </div>
                    {isAdmin && issue.user?.phone && (
                      <div className="flex items-center gap-4">
                        <Phone size={28} className="text-green-600" />
                        <span>{issue.user.phone}</span>
                      </div>
                    )}
                    {isAdmin && issue.user?.email && (
                      <div className="flex items-center gap-4">
                        <Mail size={28} className="text-purple-600" />
                        <span>{issue.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-8 rounded-3xl">
                  <h4 className="text-2xl font-bold text-slate-800 mb-4">Full Description</h4>
                  <p className="text-lg text-slate-700 leading-relaxed">{issue.description}</p>
                </div>

                {/* Location */}
                <div className="bg-gray-50 p-8 rounded-3xl flex items-start gap-5">
                  <MapPin size={36} className="text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-3">Location</h4>
                    <p className="text-lg text-slate-700">
                      {issue.location?.address || 'GPS coordinates captured'}
                    </p>
                  </div>
                </div>

                {/* ADMIN ACTION BUTTONS */}
                {isAdmin && issue.status !== 'Resolved' && (
                  <div className="flex gap-6 pt-6">
                    {issue.status === 'Pending' && (
                      <button
                        onClick={() => updateStatus('In Progress')}
                        disabled={updating}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 transition transform hover:scale-105"
                      >
                        <Clock size={32} />
                        Accept & Start Work
                      </button>
                    )}

                    {issue.status === 'In Progress' && (
                      <button
                        onClick={() => updateStatus('Resolved')}
                        disabled={updating}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 transition transform hover:scale-105"
                      >
                        <CheckCircle size={32} />
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                )}

                {/* CITIZEN DELETE BUTTON */}
                {!isAdmin && isOwner && issue.status !== 'Resolved' && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-4 transition"
                  >
                    <Trash2 size={28} />
                    {deleting ? 'Deleting...' : 'Delete This Complaint'}
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
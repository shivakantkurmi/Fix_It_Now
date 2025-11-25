// src/components/IssueCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, Eye, X, Trash2, AlertCircle } from 'lucide-react';
import { API_URL } from '../App';

function IssueCard({ issue, user, isAdmin = false, refresh, notify }) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Check if current user is the owner of the complaint
  const isOwner = user && issue.user && (
    issue.user._id === user._id || 
    (typeof issue.user === 'object' && issue.user._id === user._id)
  );

  // ADMIN: Change status function
  const handleStatusChange = async (newStatus) => {
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
        setShowModal(false);
        if (refresh) refresh();
      } else {
        const err = await res.json();
        notify(err.message || 'Update failed', 'error');
      }
    } catch (err) {
      notify('Connection error', 'error');
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
        notify('Complaint deleted successfully');
        setShowModal(false);
        if (refresh) refresh();
      } else {
        notify('Failed to delete', 'error');
      }
    } catch {
      notify('Network error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const statusColors = {
    'Pending': 'bg-red-100 text-red-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Resolved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-gray-100 text-gray-700',
  };

  return (
    <>
      {/* Card */}
      <motion.div
        onClick={() => setShowModal(true)}
        whileHover={{ y: -8 }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-100 overflow-hidden"
      >
        <div className="h-48 relative">
          {issue.imageUrl ? (
            <img src={issue.imageUrl} alt="Issue" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Camera size={48} className="text-gray-400" />
            </div>
          )}
          <div className={`absolute top-3 right-3 px-4 py-2 rounded-full text-xs font-bold ${statusColors[issue.status] || 'bg-gray-100'}`}>
            {issue.status}
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
              {issue.category}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(issue.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{issue.title}</h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{issue.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
            <MapPin size={14} className="text-indigo-600" />
            <span>{issue.location?.address || 'Location captured'}</span>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-red-100 transition"
            >
              <X size={28} className="text-red-600" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="h-96 md:h-full">
                {issue.imageUrl ? (
                  <img src={issue.imageUrl} alt="Complaint" className="w-full h-full object-cover rounded-t-3xl md:rounded-l-3xl" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-3xl md:rounded-l-3xl">
                    <Camera size={80} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-10 space-y-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-5 py-2 rounded-full font-bold text-sm ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>
                    <span className="text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-gray-800">{issue.title}</h2>
                  <p className="text-indigo-600 font-bold text-lg mt-2">{issue.category}</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-700 mb-3">Description</h4>
                  <p className="text-gray-700">{issue.description}</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-gray-700 mb-3">Location</h4>
                  <p className="text-gray-700 flex items-start gap-3">
                    <MapPin className="text-indigo-600 mt-1" />
                    {issue.location?.address || 'GPS Location Captured'}
                  </p>
                </div>

                {/* Citizen: Delete Button */}
                {!isAdmin && isOwner && issue.status !== 'Resolved' && (
                  <div className="pt-6 border-t">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3"
                    >
                      <Trash2 size={22} />
                      {deleting ? 'Deleting...' : 'Delete This Complaint'}
                    </button>
                  </div>
                )}

                {/* Resolved Auto-Delete Message */}
                {issue.status === 'Resolved' && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center">
                    <AlertCircle className="mx-auto mb-4 text-green-600" size={48} />
                    <p className="text-green-800 font-bold text-xl">Complaint Resolved!</p>
                    <p className="text-green-700 mt-2">Will be auto-deleted in 24 hours.</p>
                  </div>
                )}

                {/* Admin Actions */}
                {isAdmin && issue.status !== 'Resolved' && (
                  <div className="pt-6 border-t">
                    <h4 className="font-bold text-gray-700 mb-4">Admin Actions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {issue.status === 'Pending' && (
                        <button
                          onClick={() => handleStatusChange('In Progress')}
                          disabled={updating}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold disabled:opacity-70"
                        >
                          Start Work
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange('Resolved')}
                        disabled={updating}
                        className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-70"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
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
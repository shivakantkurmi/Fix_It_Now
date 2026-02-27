// src/components/IssueCard.jsx — RESPONSIVE FINAL + Enhanced Feedback
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, X, Trash2, Clock, CheckCircle, User, Phone, Mail, Star, MessageSquare, Send } from 'lucide-react';
import { API_URL } from '../App';

function IssueCard({ issue, user, isAdmin = false, notify, refresh }) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(issue.feedback?.rating || 0);
  const [feedbackComment, setFeedbackComment] = useState(issue.feedback?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(!!issue.feedback?.rating);

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

  const submitFeedback = async () => {
    if (!feedbackRating) { notify('Please select a star rating', 'error'); return; }
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`${API_URL}/issues/${issue._id}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment }),
      });
      if (res.ok) {
        notify('Thank you for your feedback!');
        setFeedbackDone(true);
        refresh && refresh();
      } else {
        const d = await res.json();
        notify(d.message || 'Failed to submit feedback', 'error');
      }
    } catch { notify('Network error', 'error'); }
    finally { setSubmittingFeedback(false); }
  };

  const statusColor = {
    Pending: 'bg-red-100 text-red-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    Resolved: 'bg-green-100 text-green-700',
  }[issue.status] || 'bg-gray-100 text-gray-700';

  const priorityMeta = {
    High:   { color: 'bg-red-600 text-white',    label: '↑ High' },
    Medium: { color: 'bg-yellow-500 text-white', label: '~ Med' },
    Low:    { color: 'bg-green-500 text-white',  label: '↓ Low' },
  }[issue.priority] || { color: 'bg-gray-200 text-gray-600', label: issue.priority || 'Medium' };

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
          {issue.priority && (
            <div className={`absolute top-3 left-3 px-2 sm:px-3 py-1 rounded-full font-bold text-xs ${priorityMeta.color} shadow`}>
              {priorityMeta.label}
            </div>
          )}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-4 py-2 rounded-full font-bold ${statusColor}`}>
                    {issue.status}
                  </span>
                  {issue.priority && (
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${priorityMeta.color}`}>
                      {priorityMeta.label} Priority
                    </span>
                  )}
                </div>

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

                {/* ── Feedback Section (Resolved issues, owner only) ── */}
                {!isAdmin && isOwner && issue.status === 'Resolved' && (
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <MessageSquare size={16} className="text-indigo-600" />
                      {feedbackDone ? 'Your Feedback' : 'Rate this Resolution'}
                    </h4>

                    {feedbackDone ? (
                      /* Show submitted feedback */
                      <div>
                        <div className="flex gap-1 mb-2">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={22} className={s <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
                          ))}
                        </div>
                        {feedbackComment && <p className="text-sm text-slate-600 italic">"{feedbackComment}"</p>}
                        <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                          <CheckCircle size={13} /> Feedback submitted — thank you!
                        </p>
                      </div>
                    ) : (
                      /* Feedback form */
                      <div className="space-y-3">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setFeedbackRating(s)}
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={28}
                                className={s <= (hoverRating || feedbackRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                              />
                            </button>
                          ))}
                          {feedbackRating > 0 && (
                            <span className="ml-2 text-sm text-slate-500 self-center">
                              {['','Poor','Fair','Good','Very Good','Excellent'][feedbackRating]}
                            </span>
                          )}
                        </div>
                        <textarea
                          value={feedbackComment}
                          onChange={e => setFeedbackComment(e.target.value)}
                          placeholder="Add a comment (optional)…"
                          rows={2}
                          className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 resize-none"
                        />
                        <button
                          onClick={submitFeedback}
                          disabled={submittingFeedback || !feedbackRating}
                          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-indigo-700 transition text-sm"
                        >
                          <Send size={15} />
                          {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Show feedback to admin */}
                {isAdmin && issue.feedback?.rating && (
                  <div className="border border-green-200 rounded-2xl p-4 bg-green-50">
                    <h4 className="font-bold text-green-800 text-sm flex items-center gap-2 mb-2">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" /> Citizen Feedback
                    </h4>
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} className={s <= issue.feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
                      ))}
                    </div>
                    {issue.feedback.comment && <p className="text-xs text-slate-600 italic">"{issue.feedback.comment}"</p>}
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

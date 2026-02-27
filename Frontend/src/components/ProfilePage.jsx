// src/components/ProfilePage.jsx — Profile editor for Citizens & Admins
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Globe, Lock, Save, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { API_URL } from '../App';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
];

export default function ProfilePage({ user, setView, notify, onUserUpdate }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    languagePreference: user?.languagePreference || 'en',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();

    if (showPwSection) {
      if (!form.newPassword) {
        notify('Enter a new password or close the password section', 'error');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        notify('New passwords do not match', 'error');
        return;
      }
      if (form.newPassword.length < 6) {
        notify('New password must be at least 6 characters', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        languagePreference: form.languagePreference,
      };
      if (showPwSection && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        notify(data.message || 'Failed to update profile', 'error');
        return;
      }

      // Merge token back (server response doesn't include it)
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);

      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setShowPwSection(false);
      notify('Profile updated successfully!');
    } catch {
      notify('Server error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setView(user.role === 'admin' ? 'admin' : 'dashboard')}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-[#0d1b3e]">My Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-indigo-700 rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-black text-slate-900 shadow-lg flex-shrink-0">
          {initials}
        </div>
        <div className="text-white">
          <p className="text-xl font-black">{user.name}</p>
          <p className="text-sm text-blue-200">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {user.role === 'admin' ? (
              <Shield size={14} className="text-yellow-400" />
            ) : (
              <CheckCircle size={14} className="text-green-400" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              {user.role === 'admin' ? 'Administrator' : 'Citizen'}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <User size={15} /> Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            required
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition"
            placeholder="Your full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Phone size={15} /> Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition"
            placeholder="e.g. 9876543210"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Globe size={15} /> Preferred Language
          </label>
          <select
            value={form.languagePreference}
            onChange={set('languagePreference')}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition bg-white"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Used for AI chatbot responses and notifications.</p>
        </div>

        {/* Password toggle */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowPwSection(p => !p)}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <Lock size={15} />
            {showPwSection ? 'Cancel password change' : 'Change Password'}
          </button>
        </div>

        {showPwSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={set('currentPassword')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm transition"
                placeholder="Current password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={set('newPassword')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm transition"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={`w-full px-4 py-3 border rounded-xl focus:border-indigo-500 outline-none text-sm transition ${
                  form.confirmPassword && form.newPassword !== form.confirmPassword
                    ? 'border-red-400 bg-red-50'
                    : 'border-slate-200'
                }`}
                placeholder="Repeat new password"
              />
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Email (read-only) */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-600">Email:</span> {user.email}
          <span className="ml-2 text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Cannot be changed</span>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#0d1b3e] hover:bg-indigo-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </motion.div>
  );
}

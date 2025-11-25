// src/App.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import CitizenDashboard from './components/CitizenDashboard';
import ReportIssue from './components/ReportIssue';
import AdminDashboard from './components/AdminDashboard';
import InfoSchemes from './components/InfoSchemes';



const BASE_URL=import.meta.env.VITE_URL;
export const API_URL = `${BASE_URL}/api`;

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setCurrentView(parsed.role === 'admin' ? 'admin' : 'dashboard');
      } catch {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const notify = (msg, type = 'success') => {
    toast[type](msg, {
      style: { borderRadius: '12px', background: '#333', color: '#fff', fontWeight: 'bold' },
      icon: type === 'error' ? 'Error' : 'Success'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setCurrentView('landing');
    notify('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1b3e] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
          className="w-20 h-20 border-8 border-white/30 border-t-yellow-400 rounded-full" 
        />
      </div>
    );
  }

  const views = {
    landing: () => <LandingPage setView={setCurrentView} />,
    login: () => <AuthPage type="login" setUser={setUser} setView={setCurrentView} notify={notify} />,
    signup: () => <AuthPage type="signup" setUser={setUser} setView={setCurrentView} notify={notify} />,
    dashboard: () => <CitizenDashboard user={user} setView={setCurrentView} notify={notify} />,
    report: () => <ReportIssue user={user} setView={setCurrentView} notify={notify} />,
    admin: () => <AdminDashboard user={user} setView={setCurrentView} notify={notify} />,
    schemes: () => <InfoSchemes user={user} setView={setCurrentView} notify={notify} />
  };

  const CurrentView = views[currentView] || views.landing;

  return (
    <>
      {/* FULL NAVY BLUE BACKGROUND - NO WHITE SPACE ANYWHERE */}
      <div className="min-h-screen bg-gradient-to-br from-slate via-indigo-50 to-purple-50 font-sans">
        
        <Navbar user={user} setView={setCurrentView} onLogout={handleLogout} currentView={currentView} />
        
        {/* Optional: Official Yellow Ticker */}
        {!user && currentView === 'landing' && (
          <div className="bg-[#0a0e1a] text-yellow-400 text-center py-2 text-xs font-bold border-b border-yellow-500/30">
            OFFICIAL CITIZEN GRIEVANCE REDRESSAL PORTAL
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.main
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-grow"  // Removed pt-20 pb-10 → now controlled by each page
          >
            <CurrentView />
          </motion.main>
        </AnimatePresence>

        <Footer />
        <Toaster position="top-center" />
      </div>
    </>
  );
}
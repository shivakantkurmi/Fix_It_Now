// src/components/Navbar.jsx
import React from 'react';
import { Globe, LogOut, FileText, PlusCircle } from 'lucide-react';

function Navbar({ user, setView, onLogout, currentView, language, setLanguage }) {
  const handleHomeClick = () => {
    if (!user) return setView('landing');
    return setView(user.role === 'admin' ? 'admin' : 'dashboard');
  };

  return (
    <nav className="bg-[#0d1b3e] text-white shadow-xl sticky top-0 z-40 border-b-4 border-yellow-500">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={handleHomeClick}>
          <div className="bg-white p-1.5 rounded-full shadow-lg group-hover:scale-105 transition">
             <img 
                src="/images/logo.png" 
                alt="Logo" 
                className="h-12 w-12 object-contain"
                onError={(e) => {e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}}
             />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Citizen Connect</span>
            <span className="text-lg md:text-xl font-black uppercase tracking-wide font-serif">FixItNow Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="flex items-center space-x-1 text-slate-300 hover:text-yellow-400 transition font-medium">
            <Globe size={18} />
            <span className="uppercase text-sm">{language}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('schemes')} 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition ${currentView === 'schemes' ? 'text-yellow-400' : 'text-slate-300 hover:text-white'}`}
              >
                <FileText size={18} />
                <span className="hidden md:inline">Schemes</span>
              </button>
              
              {user.role === 'citizen' && (
                  <button 
                    onClick={() => setView('report')} 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 px-5 py-2 rounded-full font-bold transition shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <PlusCircle size={18} />
                    <span>Lodge Complaint</span>
                  </button>
              )}

              <div className="flex items-center gap-3 border-l border-slate-600 pl-6">
                <div className="text-right hidden md:block leading-tight">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-yellow-400 uppercase tracking-wider">{user.role}</p>
                </div>
                <button onClick={onLogout} title="Logout" className="bg-red-600/20 p-2 rounded-full hover:bg-red-600 transition text-red-200 hover:text-white">
                    <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-x-4">
              <button onClick={() => setView('login')} className="hover:text-yellow-400 font-bold transition tracking-wide">LOGIN</button>
              <button onClick={() => setView('signup')} className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-400 hover:text-slate-900 transition shadow-lg">
                REGISTER
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
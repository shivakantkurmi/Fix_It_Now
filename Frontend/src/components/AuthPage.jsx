// src/components/AuthPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import { API_URL } from '../App';

function MockReCAPTCHA({ onChange }) {
    const [verified, setVerified] = useState(false);
    
    const handleClick = () => {
        setVerified(true);
        onChange(true);
    };

    return (
        <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] w-[304px] h-[78px] flex items-center justify-between px-3 shadow-sm my-4">
            <div className="flex items-center gap-3">
                <div 
                    onClick={handleClick}
                    className={`w-[28px] h-[28px] border-2 rounded-[2px] bg-white cursor-pointer flex items-center justify-center ${verified ? 'border-transparent' : 'border-[#c1c1c1] hover:border-[#b2b2b2]'}`}
                >
                    {verified && <CheckSquare className="text-green-600" size={34} fill="white" />}
                </div>
                <span className="text-[14px] text-black font-medium">I'm not a robot</span>
            </div>
            <div className="flex flex-col items-center text-center opacity-70">
                <img 
                    src="https://www.gstatic.com/recaptcha/api2/logo_48.png" 
                    alt="reCAPTCHA logo" 
                    className="w-[32px] h-[32px]" 
                    onError={(e) => {e.target.onerror = null; e.target.style.display = 'none'}}
                />
                <span className="text-[10px] text-[#555] mt-1">reCAPTCHA</span>
                <div className="text-[8px] text-[#555] mt-[2px]">
                    <span className="mr-1">Privacy</span>-<span>Terms</span>
                </div>
            </div>
        </div>
    );
}

function AuthPage({ type, setUser, setView, notify }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'citizen', phone: '' });
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const onCaptchaChange = (value) => {
    if(value) setCaptchaVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
        notify('Please verify that you are not a robot.', 'error');
        return;
    }
    setLoading(true);
    const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        setView(data.role === 'admin' ? 'admin' : 'dashboard');
        notify(`Welcome, ${data.name}!`);
      } else { notify(data.message || 'Action failed', 'error'); }
    } catch (error) { notify('Connection failed. Is backend running?', 'error'); } finally { setLoading(false); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#1e293b] min-h-[calc(100vh-100px)] flex items-center justify-center p-4 md:p-8"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white">
            <h2 className="text-3xl font-black text-[#0d1b3e] mb-2 text-center uppercase">{type === 'login' ? 'Member Login' : 'New Registration'}</h2>
            <div className="w-20 h-1.5 bg-yellow-500 mx-auto mb-10 rounded-full"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {type === 'signup' && (
                  <>
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0d1b3e] outline-none transition" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                       <input type="text" placeholder="Phone" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0d1b3e] outline-none transition" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </motion.div>
                    <motion.select initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0d1b3e] outline-none transition appearance-none cursor-pointer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="citizen">Citizen / Student</option>
                        <option value="admin">Govt Official / Admin</option>
                    </motion.select>
                  </>
                )}
                <motion.input initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0d1b3e] outline-none transition" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <motion.input initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0d1b3e] outline-none transition" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center mt-4">
                    <MockReCAPTCHA onChange={onCaptchaChange} />
                </motion.div>

                <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} type="submit" disabled={loading} className="w-full bg-[#0d1b3e] text-white py-4 rounded-lg font-bold text-lg shadow-xl hover:bg-[#1a237e] transition transform hover:-translate-y-1 mt-4">
                  {loading ? 'Processing...' : (type === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT')}
                </motion.button>
            </form>
            <div className="mt-8 text-center text-sm text-slate-500">
                {type === 'login' ? "Don't have an account?" : "Already registered?"} 
                <button onClick={() => setView(type === 'login' ? 'signup' : 'login')} className="text-[#0d1b3e] font-bold hover:underline ml-2 uppercase tracking-wide">
                  {type === 'login' ? 'Register Now' : 'Login Here'}
                </button>
            </div>
        </div>
        <div className="w-full md:w-1/2 bg-[#0d1b3e] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden text-white">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8 }}
               className="relative z-10"
             >
                 <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" alt="Illustration" className="w-72 drop-shadow-2xl mb-8 mx-auto opacity-90 hover:opacity-100 transition" onError={(e) => e.target.style.display='none'} />
                 <h3 className="text-3xl font-bold mb-4">Welcome to FixItNow</h3>
                 <p className="text-indigo-200 leading-relaxed max-w-xs mx-auto">Your voice matters. Join thousands of citizens making a difference in their community today.</p>
             </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default AuthPage;
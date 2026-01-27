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
    <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] w-full max-w-[304px] h-[78px] flex items-center justify-between px-3 shadow-sm my-4">
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
          className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px]"
          onError={(e) => (e.target.style.display = 'none')}
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

  const onCaptchaChange = (value) => value && setCaptchaVerified(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaVerified) return notify('Please verify that you are not a robot.', 'error');

    setLoading(true);
    const endpoint = type === 'login' ? '/auth/login' : '/auth/register';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        setView(data.role === 'admin' ? 'admin' : 'dashboard');
        notify(`Welcome, ${data.name}!`);
      } else notify(data.message || 'Action failed', 'error');
    } catch {
      notify('Connection failed. Is backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#1e293b] min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* LEFT FORM */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center bg-white">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1b3e] mb-2 text-center uppercase">
            {type === 'login' ? 'Member Login' : 'New Registration'}
          </h2>
          <div className="w-16 sm:w-20 h-1.5 bg-yellow-500 mx-auto mb-8 sm:mb-10 rounded-full"></div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {type === 'signup' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <input type="text" placeholder="Phone" className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <select className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="citizen">Citizen / Student</option>
                  <option value="admin">Govt Official / Admin</option>
                </select>
              </>
            )}

            <input type="email" placeholder="Email Address" className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <input type="password" placeholder="Password" className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />

            <div className="flex justify-center">
              <MockReCAPTCHA onChange={onCaptchaChange} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0d1b3e] text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg shadow-xl hover:bg-[#1a237e] transition">
              {loading ? 'Processing...' : type === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center text-sm text-slate-500">
            {type === 'login' ? "Don't have an account?" : "Already registered?"}
            <button onClick={() => setView(type === 'login' ? 'signup' : 'login')} className="text-[#0d1b3e] font-bold hover:underline ml-2 uppercase">
              {type === 'login' ? 'Register Now' : 'Login Here'}
            </button>
          </div>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="hidden md:flex w-1/2 bg-[#0d1b3e] p-10 items-center justify-center text-center relative text-white">
          <div className="relative z-10">
            <img src="https://cdni.iconscout.com/illustration/premium/thumb/login-3305943-2757111.png" alt="Illustration" className="w-64 lg:w-72 mx-auto mb-6 opacity-90" />
            <h3 className="text-2xl lg:text-3xl font-bold mb-3">Welcome to FixItNow</h3>
            <p className="text-indigo-200 leading-relaxed max-w-xs mx-auto">Your voice matters. Join thousands of citizens making a difference.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AuthPage;

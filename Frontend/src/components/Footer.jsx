import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer({ setView, user }) {

  const goHome = () => setView('landing');

  const goDashboard = () => {
    if (!user) setView('login');
    else if (user.role === 'admin') setView('admin');
    else setView('dashboard');
  };

  return (
    <footer className="bg-[#0a1535] text-white pt-12 sm:pt-16 pb-6 sm:pb-8 border-t border-indigo-900/50">
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">

        <div className="md:col-span-2">
          <h3 className="text-xl sm:text-2xl font-black text-yellow-400 mb-4 sm:mb-6 font-serif">
            FIXITNOW PORTAL
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-md">
            A community-driven initiative to streamline civic grievance redressal.
          </p>
          <div className="flex gap-3 sm:gap-4">
            <SocialIcon icon={Facebook} link="https://facebook.com" />
            <SocialIcon icon={Twitter} link="https://twitter.com" />
            <SocialIcon icon={Instagram} link="https://www.instagram.com/its_me_s.k._2005/" />
            <SocialIcon icon={Linkedin} link="https://linkedin.com/in/shivakant-kurmi-15339428a" />
          </div>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 border-b border-indigo-800 pb-2 w-fit">
            Contact Us
          </h4>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-300">
            <p className="flex items-start gap-3">
              <MapPin className="shrink-0 mt-1 text-yellow-500" size={16} />
              <span>VIT Bhopal University, Madhya Pradesh</span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="shrink-0 text-yellow-500" size={16} />
              <a href="tel:+917067103207" className="hover:text-yellow-400">+91 7067103207</a>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="shrink-0 text-yellow-500" size={16} />
              <a href="mailto:shivakantkurmi49@gmail.com" className="hover:text-yellow-400">
                shivakantkurmi49@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 border-b border-indigo-800 pb-2 w-fit">
            Quick Links
          </h4>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300">
            <li><button onClick={goHome} className="hover:text-yellow-400">Home</button></li>
            <li><button onClick={goDashboard} className="hover:text-yellow-400">Lodge Grievance</button></li>
            <li><button onClick={goDashboard} className="hover:text-yellow-400">Track Status</button></li>
            <li><button onClick={() => setView('login')} className="hover:text-yellow-400">Admin Login</button></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-indigo-900 text-center text-[10px] sm:text-xs text-slate-500">
        <p>&copy; 2025 FixItNow. Developed by Tech Team.</p>
      </div>
    </footer>
  );
}

const SocialIcon = ({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer"
     className="bg-slate-800 p-2.5 sm:p-3 rounded-full hover:bg-yellow-500 hover:text-slate-900 transition text-slate-300">
    <Icon size={16} />
  </a>
);

export default Footer;

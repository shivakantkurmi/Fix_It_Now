// src/components/Footer.jsx
import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
    return (
        <footer className="bg-[#0a1535] text-white pt-16 pb-8 border-t border-indigo-900/50">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <h3 className="text-2xl font-black text-yellow-400 mb-6 font-serif">FIXITNOW PORTAL</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-md">
                        A community-driven initiative to streamline civic grievance redressal. 
                        Connecting citizens directly with municipal authorities for a cleaner, safer environment.
                    </p>
                    <div className="flex gap-4">
                        <SocialIcon icon={Facebook} />
                        <SocialIcon icon={Twitter} />
                        <SocialIcon icon={Instagram} />
                        <SocialIcon icon={Linkedin} />
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 border-b border-indigo-800 pb-2 w-fit">Contact Us</h4>
                    <div className="space-y-4 text-sm text-slate-300">
                        <p className="flex items-start gap-3">
                            <MapPin className="shrink-0 mt-1 text-yellow-500" size={16} />
                            <span>VIT Bhopal University, Sehore,<br/>Madhya Pradesh, India 462003</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Phone className="shrink-0 text-yellow-500" size={16} />
                            <span>+91 7067103207 </span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Mail className="shrink-0 text-yellow-500" size={16} />
                            <span>shivakantkurmi49@gmail.com</span>
                        </p>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-6 border-b border-indigo-800 pb-2 w-fit">Quick Links</h4>
                    <ul className="space-y-3 text-sm text-slate-300">
                        <li><a href="#" className="hover:text-yellow-400 transition">Home</a></li>
                        <li><a href="#" className="hover:text-yellow-400 transition">Lodge Grievance</a></li>
                        <li><a href="#" className="hover:text-yellow-400 transition">Track Status</a></li>
                        <li><a href="#" className="hover:text-yellow-400 transition">Admin Login</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-indigo-900 text-center text-xs text-slate-500">
                <p>&copy; 2025 FixItNow. Developed by Tech Team.</p>
            </div>
        </footer>
    );
}

const SocialIcon = ({ icon: Icon }) => (
    <a href="#" className="bg-slate-800 p-3 rounded-full hover:bg-yellow-500 hover:text-slate-900 transition text-slate-300">
        <Icon size={18} />
    </a>
);

export default Footer;
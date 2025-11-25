// src/components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FilePlus, Share2, Settings, CheckCircle, ChevronRight, 
  ShieldCheck, Zap, Users, MapPin, ArrowRight, Sparkles 
} from 'lucide-react';

export default function LandingPage({ setView }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <>
      {/* Full Screen Dark Background - ZERO WHITE GAP */}
      <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">

        {/* Floating Orbs Background */}
        <div className="fixed inset-0 pointer-events-none">
          <motion.div style={{ y: y1 }} className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-r from-yellow-500/20 to-orange-500/10 rounded-full blur-3xl" />
          <motion.div style={{ y: y2 }} className="absolute bottom-0 -right-40 w-80 h-80 bg-gradient-to-l from-indigo-600/20 to-purple-600/10 rounded-full blur-3xl" />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-transparent via-[#0d1b3e]/20 to-transparent" />
        </div>

        {/* Hero Section */}
        <motion.section style={{ opacity }} className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
          <div className="container mx-auto text-center">
            {/* Official Badge */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 bg-yellow-500/10 border-2 border-yellow-500/30 px-10 py-4 rounded-full mb-12 text-yellow-400 font-bold text-sm uppercase tracking-widest shadow-2xl backdrop-blur-xl"
            >
              <ShieldCheck size={22} />
              National Citizen Grievance Redressal System
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black leading-tight mb-8"
            >
              <span className="block">Empowering</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 drop-shadow-2xl">
                Change
              </span>
              <span className="block">One Click at a Time</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl text-indigo-100 max-w-4xl mx-auto mb-16 font-light leading-relaxed"
            >
              India’s most advanced civic complaint portal • AI-powered • Real-time tracking • 100% transparent
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <button
                onClick={() => setView('login')}
                className="group relative px-16 py-7 bg-gradient-to-r from-yellow-400 to-orange-500 text-[#0a0e1a] rounded-full text-2xl font-black shadow-2xl hover:shadow-yellow-500/60 transition-all duration-300 hover:scale-105 flex items-center gap-4 justify-center"
              >
                ENTER PORTAL NOW
                <ArrowRight className="group-hover:translate-x-2 transition" size={32} />
              </button>
              <button
                onClick={() => setView('signup')}
                className="px-16 py-7 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-full text-xl font-bold hover:bg-white/20 transition-all duration-300"
              >
                Register Free
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* 4-Step Process - 3D Floating Cards */}
        <section className="relative py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black mb-6">How It Works</h2>
              <p className="text-xl text-indigo-200">From complaint to resolution in 4 simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-7xl mx-auto">
              {[
                { icon: FilePlus, title: "Report Issue", desc: "Take photo & submit in 10 seconds", color: "from-pink-500 to-rose-600", delay: 0.2 },
                { icon: Share2, title: "Auto Assign", desc: "AI routes to correct department", color: "from-blue-500 to-cyan-600", delay: 0.4 },
                { icon: Settings, title: "Work Starts", desc: "Officials begin resolution instantly", color: "from-amber-500 to-orange-600", delay: 0.6 },
                { icon: CheckCircle, title: "Resolved", desc: "Get proof of fix & close case", color: "from-emerald-500 to-teal-600", delay: 0.8 }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: step.delay, duration: 0.8 }}
                  whileHover={{ y: -20, rotateY: 10 }}
                  className="group perspective-1000"
                >
                  <div className="relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition`} />
                    <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 text-center h-full transform-gpu transition-all duration-500 group-hover:scale-105">
                      <div className={`w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${step.color} p-1`}>
                        <div className="w-full h-full bg-[#0a0e1a] rounded-3xl flex items-center justify-center">
                          <step.icon size={56} className="text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-indigo-200">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-to-b from-transparent via-[#0d1b3e]/50 to-transparent">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {[
                { value: "5M+", label: "Complaints Resolved" },
                { value: "98.2%", label: "Satisfaction Rate" },
                { value: "24hrs", label: "Avg. Response Time" },
                { value: "1.2Cr+", label: "Active Citizens" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20"
                >
                  <div className="text-5xl font-black text-yellow-400 mb-2">{stat.value}</div>
                  <div className="text-indigo-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="container mx-auto px-6"
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              Be the Change India Needs
            </h2>
            <button
              onClick={() => setView('login')}
              className="group inline-flex items-center gap-6 px-20 py-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-[#0a0e1a] rounded-full text-3xl font-black shadow-2xl hover:shadow-yellow-500/80 transition-all duration-500 hover:scale-110"
            >
              START REPORTING NOW
              <Sparkles className="group-hover:rotate-12 transition" size={40} />
            </button>
          </motion.div>
        </section>
      </div>
    </>
  );
}
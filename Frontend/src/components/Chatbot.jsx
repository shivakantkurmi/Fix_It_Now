// src/components/Chatbot.jsx — Floating multilingual AI chatbot
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react';
import { API_URL } from '../App';

const SUGGESTED_QUESTIONS = [
  'How do I report a pothole?',
  'What schemes are available for farmers?',
  'Where is the nearest Aadhaar center?',
  'How long does issue resolution take?',
];

export default function Chatbot({ user, language }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your FixItNow AI assistant. I can help you report civic issues, find government schemes, locate local facilities, and more. How can I assist you today?`,
      id: 'welcome',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [messages, open]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text: text.trim(), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for multi-turn context (exclude welcome)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          language: language || user?.languagePreference || 'en',
          history,
        }),
      });

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: data.reply,
          id: Date.now() + 1,
          error: data.error,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "Sorry, I'm having trouble connecting. Please try again.",
          id: Date.now() + 1,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setOpen(p => !p)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center"
        title="AI Assistant"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0d1b3e] to-indigo-700 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Bot size={20} className="text-slate-900" />
                </div>
                <div>
                  <p className="font-bold text-sm">FixItNow AI</p>
                  <p className="text-[10px] text-blue-200 uppercase tracking-wider">Civic Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-yellow-400 text-slate-900'
                  }`}>
                    {msg.role === 'user'
                      ? <User size={14} />
                      : <Bot size={14} />
                    }
                  </div>
                  {/* Bubble */}
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : msg.error
                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                        : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 flex-shrink-0 flex items-center justify-center">
                    <Bot size={14} className="text-slate-900" />
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <Loader size={16} className="animate-spin text-indigo-500" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggested questions (shown when only welcome message) */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0 bg-slate-50">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything…"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">Powered by Gemini AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

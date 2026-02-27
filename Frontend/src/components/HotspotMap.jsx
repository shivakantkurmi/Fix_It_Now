// src/components/HotspotMap.jsx — Enhanced SVG heatmap with animated clusters
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, ExternalLink, BarChart2, Map } from 'lucide-react';
import { API_URL } from '../App';

const CATEGORY_COLORS = {
  Pothole:         '#f87171',
  Garbage:         '#fb923c',
  'Street Light':  '#facc15',
  'Water Leakage': '#60a5fa',
  Electricity:     '#c084fc',
  Other:           '#94a3b8',
};

const HEAT_SCALE = ['#fde68a', '#fbbf24', '#f59e0b', '#ef4444', '#b91c1c'];

function heatColor(count, maxCount) {
  const ratio = Math.min(count / Math.max(maxCount, 1), 1);
  const idx = Math.min(Math.floor(ratio * (HEAT_SCALE.length - 1)), HEAT_SCALE.length - 1);
  return HEAT_SCALE[idx];
}

const PULSE_CSS = `
  @keyframes hsPulse {
    0%   { opacity: 0.7; }
    70%  { opacity: 0; }
    100% { opacity: 0; }
  }
  @keyframes hsGlow {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.55; }
  }
  .hs-pulse { animation: hsPulse 2.2s ease-out infinite; }
  .hs-glow  { animation: hsGlow  3s   ease-in-out infinite; }
`;

export default function HotspotMap({ user, notify }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeCluster, setActiveCluster] = useState(null);
  const [view, setView]               = useState('clusters');

  useEffect(() => {
    const fetchHotspots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/analytics/hotspots`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) setData(await res.json());
        else notify('Failed to load hotspot data', 'error');
      } catch {
        notify('Network error loading hotspots', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-indigo-600 flex items-center justify-center">
            <MapPin size={20} className="text-white" />
          </div>
        </div>
        <span className="text-slate-500 font-medium">Analysing issue hotspots…</span>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <MapPin size={48} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium">No geo-tagged issues to map yet.</p>
        <p className="text-xs mt-1">Issues need GPS co-ordinates to appear here.</p>
      </div>
    );
  }

  const W = 500, H = 300, PAD = 28;
  const plotW = W - PAD * 2, plotH = H - PAD * 2;

  const lats = data.points.map(p => p.lat);
  const lngs = data.points.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const toSvg = (lat, lng) => ({
    x: PAD + ((lng - minLng) / lngRange) * plotW,
    y: PAD + (1 - (lat - minLat) / latRange) * plotH,
  });

  const maxCount = Math.max(...(data.clusters || []).map(c => c.count), 1);
  const clusterR = (count) => Math.max(12, Math.min(44, 12 + (count / maxCount) * 32));

  return (
    <div className="space-y-5">
      <style>{PULSE_CSS}</style>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Issue Hotspot Map
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {data.total} geo-tagged issue{data.total !== 1 ? 's' : ''} · {data.clusters?.length || 0} cluster{data.clusters?.length !== 1 ? 's' : ''} · K-Means
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 text-xs font-bold">
          {[['clusters', <Map size={12} key="m" />, 'Clusters'], ['scatter', <BarChart2 size={12} key="b" />, 'All Points']].map(
            ([val, icon, label]) => (
              <button
                key={val}
                onClick={() => setView(val)}
                className={`flex items-center gap-1.5 px-4 py-2 transition ${
                  view === val ? 'bg-[#0d1b3e] text-white' : 'bg-white text-slate-500 hover:text-slate-700'
                }`}
              >
                {icon} {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
        style={{ background: 'radial-gradient(ellipse at 50% 110%, #1c2a4a 0%, #0d1628 60%, #060d1a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1.5 left-3 text-[9px] text-slate-600 font-mono select-none">N {maxLat.toFixed(3)}°</div>
        <div className="absolute bottom-5 left-3 text-[9px] text-slate-600 font-mono select-none">S {minLat.toFixed(3)}°</div>
        <div className="absolute top-1.5 right-3 text-[9px] text-slate-600 font-mono select-none">E {maxLng.toFixed(3)}°</div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full relative z-10" style={{ minHeight: 220, maxHeight: 340 }}>
          <defs>
            {(data.clusters || []).map((c, i) => {
              const color = heatColor(c.count, maxCount);
              return (
                <radialGradient key={i} id={`halo-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={color} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </radialGradient>
              );
            })}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {view === 'scatter' && data.points.map((p, i) => {
            const { x, y } = toSvg(p.lat, p.lng);
            return (
              <circle key={i} cx={x} cy={y} r={3.5}
                fill={CATEGORY_COLORS[p.category] || '#94a3b8'}
                opacity={0.75} stroke="#0d1628" strokeWidth="0.5" />
            );
          })}

          {view === 'clusters' && (data.clusters || []).map((c, i) => {
            const { x, y } = toSvg(c.lat, c.lng);
            const r = clusterR(c.count);
            const color = heatColor(c.count, maxCount);
            const isActive = activeCluster === i;
            return (
              <g key={i} onClick={() => setActiveCluster(isActive ? null : i)} style={{ cursor: 'pointer' }}>
                <circle className="hs-glow" cx={x} cy={y} r={r * 2.8}
                  fill={`url(#halo-${i})`} style={{ animationDelay: `${i * 0.4}s` }} />
                <circle className="hs-pulse" cx={x} cy={y} r={r + 4}
                  fill="none" stroke={color} strokeWidth="2.5"
                  style={{ animationDelay: `${i * 0.55}s` }} />
                <circle className="hs-pulse" cx={x} cy={y} r={r + 2}
                  fill="none" stroke={color} strokeWidth="1.5"
                  style={{ animationDelay: `${i * 0.55 + 1.1}s` }} />
                {isActive && (
                  <circle cx={x} cy={y} r={r + 8} fill="none" stroke="white"
                    strokeWidth="2" strokeDasharray="4 4" opacity={0.8} />
                )}
                <circle cx={x} cy={y} r={r} fill={color} filter="url(#glow)" opacity={0.92}
                  stroke={isActive ? 'white' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={isActive ? 2.5 : 1} />
                <circle cx={x} cy={y} r={r - 4} fill="none"
                  stroke={CATEGORY_COLORS[c.dominant] || '#94a3b8'} strokeWidth="2.5" opacity={0.7} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={r > 22 ? 13 : 10} fontWeight="900" fill="#0d1628">
                  {c.count}
                </text>
                <text x={x} y={y + r + 11} textAnchor="middle" fontSize={9} fontWeight="700" fill="rgba(255,255,255,0.5)">
                  #{i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 px-3 py-1 flex items-center justify-between bg-black/40 text-[9px] text-slate-600 font-mono">
          <span>FixItNow Geospatial Intelligence</span>
          <span>© OpenData</span>
        </div>
      </div>

      {/* Heat Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Intensity:</span>
        <div className="flex items-center gap-1">
          {HEAT_SCALE.map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-sm" style={{ backgroundColor: c }}
              title={['Very Low','Low','Medium','High','Critical'][i]} />
          ))}
        </div>
        <span className="text-[10px] text-slate-400">Low → Critical</span>
        <div className="ml-auto flex flex-wrap gap-2">
          {Object.entries(CATEGORY_COLORS).map(([cat, clr]) => (
            <span key={cat} className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: clr }} />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Active Cluster Detail */}
      <AnimatePresence>
        {view === 'clusters' && activeCluster !== null && data.clusters[activeCluster] && (
          <motion.div
            key={activeCluster}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold flex items-center gap-2 text-base">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-slate-900"
                  style={{ backgroundColor: heatColor(data.clusters[activeCluster].count, maxCount) }}>
                  {activeCluster + 1}
                </span>
                Cluster #{activeCluster + 1} —{' '}
                <span style={{ color: heatColor(data.clusters[activeCluster].count, maxCount) }}>
                  {data.clusters[activeCluster].count} issue{data.clusters[activeCluster].count !== 1 ? 's' : ''}
                </span>
              </h4>
              <a href={`https://www.google.com/maps?q=${data.clusters[activeCluster].lat},${data.clusters[activeCluster].lng}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition">
                View on Maps <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(data.clusters[activeCluster].categories).map(([cat, cnt]) => (
                <span key={cat} className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8' }}>
                  {cat}: {cnt}
                </span>
              ))}
            </div>
            <div className="space-y-1.5">
              {Object.entries(data.clusters[activeCluster].categories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, cnt]) => {
                  const pct = Math.round((cnt / data.clusters[activeCluster].count) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="w-20 text-[10px] text-slate-400 font-medium truncate">{cat}</span>
                      <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8' }} />
                      </div>
                      <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-3">
              Centre: {data.clusters[activeCluster].lat.toFixed(5)}°N, {data.clusters[activeCluster].lng.toFixed(5)}°E
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cluster List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(data.clusters || []).map((c, i) => {
          const color = heatColor(c.count, maxCount);
          return (
            <motion.div key={i} whileHover={{ scale: 1.02 }}
              onClick={() => { setView('clusters'); setActiveCluster(i); }}
              className={`flex items-center justify-between bg-white border-2 rounded-2xl px-4 py-3 cursor-pointer transition ${
                activeCluster === i ? 'border-indigo-500 shadow-lg' : 'border-slate-100 hover:border-indigo-200'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-slate-900 shadow-md flex-shrink-0"
                  style={{ backgroundColor: color }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{c.dominant} Hotspot</p>
                  <p className="text-xs text-slate-400">{c.count} issue{c.count !== 1 ? 's' : ''}</p>
                  <div className="flex gap-1 mt-1">
                    {Object.keys(c.categories).slice(0, 4).map(cat => (
                      <span key={cat} className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || '#94a3b8' }} title={cat} />
                    ))}
                  </div>
                </div>
              </div>
              <a href={`https://www.google.com/maps?q=${c.lat},${c.lng}`}
                target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-indigo-400 hover:text-indigo-600 transition p-2 rounded-full hover:bg-indigo-50">
                <ExternalLink size={15} />
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Search, Settings, ArrowLeft, ChevronRight, Check, X } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';

const ScanLines = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)',
  }} />
);

const CornerAccentTL = ({ color = '#3b82f6' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
    <path d="M0 10 L0 0 L10 0" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);
const CornerAccentBR = ({ color = '#3b82f6' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: 'absolute', bottom: 0, right: 0 }}>
    <path d="M20 10 L20 20 L10 20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

type ScanParam = { name: string; detail: string };

const QUICK_PARAMS: ScanParam[] = [
  { name: 'Digital Signature', detail: 'Verifying app authenticity and publisher credentials' },
  { name: 'Permission Analysis', detail: 'Analyzing requested permissions' },
  { name: 'Malware Detection', detail: 'Scanning for malicious code' },
  { name: 'Network Behavior', detail: 'Checking suspicious network comms' },
];

const DEEP_CUSTOM_PARAMS: ScanParam[] = [
  { name: 'Digital Signature', detail: 'Verifying app authenticity and publisher credentials' },
  { name: 'Permission Analysis', detail: 'Analyzing requested permissions' },
  { name: 'Malware Detection', detail: 'Scanning for malicious code' },
  { name: 'Network Behavior', detail: 'Checking suspicious network comms' },
  { name: 'Androguard Analysis', detail: 'Static reverse engineering of APK' },
  { name: 'AI Model Prediction', detail: 'ML risk scoring' },
  { name: 'VirusTotal AV Scan', detail: 'Multi-engine AV results' },
  { name: 'VT Sandbox', detail: 'Dynamic sandbox results' },
  { name: 'MITRE ATT&CK Mapping', detail: 'Mapping to ATT&CK tactics' },
  { name: 'Custom Sandbox', detail: 'Dynamic malware behavior analysis' },
];

type InfoPanelProps = {
  params: ScanParam[];
  accentColor: string;
  title: string;
  onClose: () => void;
};

const InfoPanel = ({ params, accentColor, title, onClose }: InfoPanelProps) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 12, right: 12, zIndex: 50, width: 280,
        background: 'rgba(8,14,30,.97)',
        border: `0.5px solid ${accentColor}40`,
        borderRadius: 12, overflow: 'hidden',
        boxShadow: `0 12px 40px rgba(0,0,0,.6), 0 0 0 0.5px ${accentColor}20`,
      }}
    >
      <div style={{
        padding: '11px 14px', borderBottom: `0.5px solid ${accentColor}25`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: `${accentColor}0a`,
      }}>
        <span style={{ fontSize: 10, color: accentColor, fontFamily: 'monospace', letterSpacing: '0.07em', fontWeight: 600 }}>
          {title.toUpperCase()} · PARAMETERS
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
          <X size={13} />
        </button>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
        {params.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: accentColor, marginTop: 5, flexShrink: 0, boxShadow: `0 0 5px ${accentColor}80` }} />
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#c7d7f0', lineHeight: 1.3 }}>{p.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4e6080', lineHeight: 1.5 }}>{p.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </AnimatePresence>
);

type ScanCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  duration: string;
  features: string[];
  params: ScanParam[];
  accentColor: string;
  glowColor: string;
  badge?: string;
  delay: number;
  onClick: () => void;
};

const ScanCard = ({ icon: Icon, title, description, duration, features, params, accentColor, glowColor, badge, delay, onClick }: ScanCardProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{
        position: 'relative', background: 'rgba(15,23,42,.9)',
        border: `0.5px solid rgba(148,163,184,.15)`, borderRadius: 14,
        overflow: 'visible', cursor: 'pointer', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ height: 2, background: `linear-gradient(90deg,${accentColor},transparent)`, borderRadius: '14px 14px 0 0' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: `radial-gradient(circle at 50% 0%,${glowColor}18 0%,transparent 55%)`, pointerEvents: 'none' }} />
      <CornerAccentTL color={accentColor} />
      <CornerAccentBR color={accentColor} />

      <div style={{ padding: '32px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: `${accentColor}18`, border: `0.5px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} color={accentColor} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {badge && (
              <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, background: `${accentColor}18`, border: `0.5px solid ${accentColor}40`, color: accentColor, fontFamily: 'monospace', letterSpacing: '0.06em' }}>{badge}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
              title="View scan parameters"
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: showInfo ? `${accentColor}25` : `${accentColor}12`,
                border: `0.5px solid ${accentColor}${showInfo ? '70' : '40'}`,
                color: accentColor, fontSize: 14, fontWeight: 700, fontFamily: 'monospace',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all .15s', lineHeight: 1,
              }}
            >
              ⓘ
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>{description}</p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, marginBottom: 20, background: 'rgba(148,163,184,.06)', border: '0.5px solid rgba(148,163,184,.12)', width: 'fit-content' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.06em' }}>EST. {duration.toUpperCase()}</span>
        </div>

        <div style={{ background: 'rgba(0,0,0,.3)', border: '0.5px solid rgba(148,163,184,.08)', borderRadius: 10, padding: '16px 18px', marginBottom: 24, flex: 1 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: `${accentColor}18`, border: `0.5px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={10} color={accentColor} />
              </div>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 10, background: `${accentColor}15`, border: `0.5px solid ${accentColor}40`, color: accentColor, fontWeight: 600, fontSize: 14, transition: 'all .2s' }}>
          Start {title}
          <ChevronRight size={15} />
        </div>
      </div>

      {showInfo && (
        <InfoPanel params={params} accentColor={accentColor} title={title} onClose={() => setShowInfo(false)} />
      )}
    </motion.div>
  );
};

export default function ScanSelection() {
  const navigate = useNavigate();
  const { state, dispatch } = useScan();

  // ✅ FIX 1: All scan types navigate immediately, no setTimeout
  const handleScanTypeSelect = (scanType: 'deep' | 'quick' | 'custom') => {
    dispatch({ type: 'SET_SCAN_TYPE', payload: scanType });
    dispatch({ type: 'START_SCAN' });
    navigate('/scan-results');
  };

  const scanTypes = [
    {
      type: 'quick' as const,
      icon: Zap,
      title: 'Quick Scan',
      description: 'Basic verification of app signature, permissions, and malware detection.',
      duration: '20 seconds',
      features: ['Digital signature verification', 'Permission analysis', 'Basic malware detection'],
      params: QUICK_PARAMS,
      accentColor: '#22c55e',
      glowColor: '#16a34a',
      badge: 'FAST',
    },
    {
      type: 'deep' as const,
      icon: Search,
      title: 'Deep Scan',
      description: 'Comprehensive full APK analysis with behavioral pattern recognition.',
      duration: '40 seconds',
      features: ['Advanced threat detection', 'Bytecode analysis', 'Network behavior check', 'Complete security audit'],
      params: DEEP_CUSTOM_PARAMS,
      accentColor: '#3b82f6',
      glowColor: '#2563eb',
      badge: 'RECOMMENDED',
    },
    {
      type: 'custom' as const,
      icon: Settings,
      title: 'Custom Scan',
      description: 'Tailored analysis with banking-specific and compliance checks.',
      duration: '1 minute',
      features: ['Banking-specific checks', 'Financial data protection', 'Custom rule sets', 'Regulatory compliance'],
      params: DEEP_CUSTOM_PARAMS,
      accentColor: '#f59e0b',
      glowColor: '#d97706',
      badge: 'ADVANCED',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#020817 0%,#0a0f1e 50%,#020817 100%)', fontFamily: '"Inter","SF Pro Display",-apple-system,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 70%)', top: -150, left: -150, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)', bottom: -100, right: -100, pointerEvents: 'none', zIndex: 0 }} />
      <ScanLines />
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <button onClick={() => navigate('/')} style={{ width: 38, height: 38, borderRadius: 10, border: '0.5px solid rgba(148,163,184,.15)', background: 'rgba(15,23,42,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0, transition: 'all .2s' }}>
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              <span style={{ width: 3, height: 24, background: '#3b82f6', borderRadius: 2 }} />
              Choose Scan Type
            </h1>
          </motion.div>
        </motion.div>

        {(state.data.file || state.data.url) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 10, marginBottom: 40, background: 'rgba(59,130,246,.06)', border: '0.5px solid rgba(59,130,246,.25)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.04em' }}>TARGET</span>
            <span style={{ fontSize: 13, color: '#93c5fd', fontFamily: 'monospace' }}>
              {state.data.file ? `${state.data.file.name} · ${(state.data.file.size / 1024 / 1024).toFixed(2)} MB` : state.data.url}
            </span>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {scanTypes.map((scan, i) => (
            <ScanCard key={scan.type} {...scan} delay={i * 0.1} onClick={() => handleScanTypeSelect(scan.type)} />
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#334155', fontFamily: 'monospace' }}>
          ALL SCANS PROCESSED IN ISOLATED SANDBOXES · DATA NOT RETAINED AFTER SESSION
        </motion.p>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Upload, Link, UserPlus, FileCheck,
  Activity, AlertTriangle, Zap, Database, ChevronRight, Lock, Eye, Cpu
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';
import Button from '../components/Button';

/* ─── Animated counter ─────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Scan-line overlay ─────────────────────────────────── */
const ScanLines = () => (
  <div
    aria-hidden
    style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)',
    }}
  />
);

/* ─── Glowing corner accent ─────────────────────────────── */
const CornerAccent = ({ color = '#3b82f6' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 0, left: 0 }}>
    <path d="M0 12 L0 0 L12 0" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);
const CornerAccentBR = ({ color = '#3b82f6' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', bottom: 0, right: 0 }}>
    <path d="M24 12 L24 24 L12 24" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

/* ─── Section heading ───────────────────────────────────── */
const SectionHeading = ({ children, accent = '#3b82f6' }: { children: React.ReactNode; accent?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
    <span style={{ display: 'block', width: 3, height: 24, background: accent, borderRadius: 2 }} />
    <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0', margin: 0, letterSpacing: '0.02em' }}>{children}</h2>
    <span style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg,rgba(148,163,184,.3),transparent)' }} />
  </div>
);

/* ─── Feature card ──────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, label, sub, color, delay }: {
  icon: React.ElementType; label: string; sub: string; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    style={{
      position: 'relative',
      background: 'rgba(15,23,42,.85)',
      border: '0.5px solid rgba(148,163,184,.15)',
      borderRadius: 12,
      padding: '28px 24px',
      cursor: 'default',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 12,
      background: `radial-gradient(circle at 0% 0%, ${color}18 0%, transparent 60%)`,
      pointerEvents: 'none',
    }} />
    <CornerAccent color={color} />
    <CornerAccentBR color={color} />
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: `${color}18`,
      border: `0.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <Icon size={20} color={color} />
    </div>
    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15, margin: '0 0 6px' }}>{label}</p>
    <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{sub}</p>
  </motion.div>
);

/* ─── Step ──────────────────────────────────────────────── */
const Step = ({ n, label, sub, last }: { n: number; label: string; sub: string; last?: boolean }) => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(59,130,246,.12)', border: '0.5px solid rgba(59,130,246,.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#60a5fa', fontWeight: 700, fontSize: 14, fontFamily: 'monospace',
      }}>
        {String(n).padStart(2, '0')}
      </div>
      {!last && <div style={{ width: '0.5px', flex: 1, minHeight: 40, background: 'rgba(59,130,246,.2)', margin: '8px 0' }} />}
    </div>
    <div style={{ paddingBottom: last ? 0 : 32 }}>
      <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15, margin: '8px 0 4px' }}>{label}</p>
      <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{sub}</p>
    </div>
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { dispatch } = useScan();
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState('');
  const [urlFocus, setUrlFocus] = useState(false);
  const [tick, setTick] = useState(0);

  /* blinking cursor tick */
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  const handleFileUpload = (file: File) => {
    if (file?.name.endsWith('.apk')) {
      dispatch({ type: 'SET_FILE', payload: file });
      navigate('/scan-selection');
    }
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      dispatch({ type: 'SET_URL', payload: url });
      navigate('/scan-selection');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  /* ── Styles ── */
  const s: Record<string, React.CSSProperties> = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#020817 0%,#0a0f1e 50%,#020817 100%)',
      color: '#94a3b8',
      fontFamily: '"Inter","SF Pro Display",-apple-system,sans-serif',
      position: 'relative',
      overflow: 'hidden',
    },
    /* radial glow blobs */
    blob1: {
      position: 'fixed', width: 600, height: 600, borderRadius: '50%',
      background: 'radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 70%)',
      top: -200, left: -200, pointerEvents: 'none', zIndex: 0,
    },
    blob2: {
      position: 'fixed', width: 500, height: 500, borderRadius: '50%',
      background: 'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)',
      bottom: -150, right: -100, pointerEvents: 'none', zIndex: 0,
    },
    container: { maxWidth: 960, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 },

    /* hero */
    heroWrap: { paddingTop: 120, paddingBottom: 80, textAlign: 'center' },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 100,
      background: 'rgba(59,130,246,.1)', border: '0.5px solid rgba(59,130,246,.3)',
      color: '#60a5fa', fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.08em',
      marginBottom: 28,
    },
    dot: {
      width: 6, height: 6, borderRadius: '50%',
      background: '#22c55e',
      boxShadow: '0 0 6px #22c55e',
      animation: 'pulse 2s infinite',
    },
    heroTitle: {
      fontSize: 72, fontWeight: 800, lineHeight: 1,
      letterSpacing: '-0.03em', margin: '0 0 6px',
    },
    heroSub1: { fontSize: 16, color: '#475569', margin: '20px 0 8px', letterSpacing: '0.08em', fontFamily: 'monospace' },
    heroSub2: { fontSize: 18, color: '#94a3b8', margin: '0 0 48px' },

    /* upload card */
    uploadCard: {
      background: 'rgba(15,23,42,.9)',
      border: '0.5px solid rgba(148,163,184,.12)',
      borderRadius: 16,
      padding: 40,
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
    },
    uploadCardGlow: {
      position: 'absolute', inset: 0, borderRadius: 16,
      background: 'radial-gradient(ellipse at 50% 0%,rgba(59,130,246,.08) 0%,transparent 60%)',
      pointerEvents: 'none',
    },
    uploadGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 },
    uploadDivider: {
      position: 'absolute', left: '50%', top: 40, bottom: 40,
      width: '0.5px', background: 'rgba(148,163,184,.1)',
    },
    dropzone: {
      border: `1px dashed ${dragActive ? 'rgba(59,130,246,.8)' : 'rgba(148,163,184,.2)'}`,
      background: dragActive ? 'rgba(59,130,246,.06)' : 'rgba(15,23,42,.5)',
      borderRadius: 12,
      padding: '48px 24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all .2s',
      position: 'relative',
    },
    dropLabel: { color: '#475569', fontSize: 13, marginTop: 12, lineHeight: 1.6 },
    uploadInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' },
    colLabel: { color: '#64748b', fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 14, display: 'block' },

    urlInput: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 10,
      background: 'rgba(15,23,42,.8)',
      border: `0.5px solid ${urlFocus ? 'rgba(59,130,246,.5)' : 'rgba(148,163,184,.15)'}`,
      color: '#e2e8f0',
      fontSize: 14,
      fontFamily: 'monospace',
      outline: 'none',
      transition: 'border-color .2s',
      boxSizing: 'border-box',
    },
    analyzeBtn: {
      marginTop: 12, width: '100%',
      padding: '14px 0',
      borderRadius: 10,
      background: 'rgba(59,130,246,.15)',
      border: '0.5px solid rgba(59,130,246,.4)',
      color: '#60a5fa',
      fontSize: 14, fontWeight: 600,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'all .2s',
    },

    /* stat cards */
    statCard: {
      background: 'rgba(15,23,42,.7)',
      border: '0.5px solid rgba(148,163,184,.1)',
      borderRadius: 12,
      padding: '28px 24px',
      textAlign: 'center',
    },
    statNum: { fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', display: 'block', lineHeight: 1, marginBottom: 6 },
    statLabel: { fontSize: 12, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.06em' },

    /* sample report */
    reportCard: {
      background: 'rgba(15,23,42,.9)',
      border: '0.5px solid rgba(239,68,68,.25)',
      borderRadius: 12,
      overflow: 'hidden',
    },
    reportHeader: {
      background: 'rgba(239,68,68,.08)',
      borderBottom: '0.5px solid rgba(239,68,68,.2)',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    reportBody: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
    reportRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 },
    riskBar: { height: 6, borderRadius: 3, background: 'rgba(148,163,184,.1)', overflow: 'hidden', flex: 1, margin: '0 12px' },

    section: { paddingTop: 80, paddingBottom: 80 },
  };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .analyze-btn:hover { background: rgba(59,130,246,.25) !important; border-color: rgba(59,130,246,.7) !important; }
        .upload-dropzone:hover { border-color: rgba(148,163,184,.35) !important; background: rgba(59,130,246,.03) !important; }
      `}</style>

      <ScanLines />
      <div style={s.blob1} />
      <div style={s.blob2} />
      <Header />

      <main style={s.container}>

        {/* ── HERO ── */}
        <div style={s.heroWrap}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
            <div style={s.badge}>
              <div style={s.dot} />
              THREAT INTELLIGENCE PLATFORM · v2.4.1
            </div>
          </motion.div>

          

          <motion.h1
            style={s.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1, duration: .6 }}
          >
            <span style={{ background: 'linear-gradient(135deg,#60a5fa 0%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              A.S.T.R.A
            </span>
          </motion.h1>

          <motion.p style={s.heroSub1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25 }}>
            ADVANCED SYSTEM FOR THREAT RECOGNITION &amp; ANALYSIS
          </motion.p>

          <motion.p style={s.heroSub2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }}>
            AI-powered Android security scanning — detect malware, suspicious permissions &amp; zero-day threats in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: .97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: .45, duration: .5 }}
          >
            <div style={s.uploadCard}>
              <div style={s.uploadCardGlow} />
              <CornerAccent color="#3b82f6" />
              <CornerAccentBR color="#7c3aed" />

              <div style={s.uploadGrid}>
                {/* File drop */}
                <div style={{ position: 'relative' }}>
                  <span style={s.colLabel}>UPLOAD APK FILE</span>
                  <div
                    className="upload-dropzone"
                    style={s.dropzone}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file" accept=".apk"
                      style={s.uploadInput}
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, margin: '0 auto 16px',
                      background: dragActive ? 'rgba(59,130,246,.2)' : 'rgba(59,130,246,.08)',
                      border: `0.5px solid ${dragActive ? 'rgba(59,130,246,.6)' : 'rgba(59,130,246,.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .2s',
                    }}>
                      <Upload size={22} color={dragActive ? '#60a5fa' : '#475569'} />
                    </div>
                    <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>
                      {dragActive ? 'Release to analyze' : 'Drop APK here'}
                    </p>
                    <p style={s.dropLabel}>or click to browse · .apk files only</p>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <span style={s.colLabel}>ENTER APK URL</span>
                  <input
                    type="url"
                    value={url}
                    placeholder={`https://example.com/app.apk${tick % 2 === 0 ? '█' : ' '}`}
                    onChange={e => setUrl(e.target.value)}
                    onFocus={() => setUrlFocus(true)}
                    onBlur={() => setUrlFocus(false)}
                    onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
                    style={s.urlInput}
                  />
                  <p style={{ fontSize: 12, color: '#334155', margin: '8px 0 0', fontFamily: 'monospace' }}>
                    Direct download URL or Google Play link
                  </p>
                  <button
                    className="analyze-btn"
                    style={s.analyzeBtn}
                    onClick={handleUrlSubmit}
                  >
                    <Shield size={15} />
                    Start Analysis
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          <p
  style={{
    marginTop: 20,
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.6,
    textAlign: "center",
    maxWidth: 600,
    marginInline: "auto",
  }}
>
  By submitting data above, you are agreeing to our{" "}
  <a
    href="https://cloud.google.com/terms"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#60a5fa", textDecoration: "underline" }}
  >
    Terms of Service
  </a>{" "}
  and{" "}
  <a
    href="https://cloud.google.com/terms/secops/privacy-notice"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#60a5fa", textDecoration: "underline" }}
  >
    Privacy Notice
  </a>
  , and to the sharing of your sample submission with the security community.
  Please do not submit any personal information; we are not responsible for the
  contents of your submission.{" "}
  <span style={{ color: "#94a3b8" }}>Learn more.</span>
</p>
        </div>

        {/* ── STATS ── */}
        <div style={{ ...s.section, paddingTop: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { to: 10482, suffix: '+', label: 'TOTAL SCANS', color: '#60a5fa' },
              { to: 2571, suffix: '+', label: 'THREATS DETECTED', color: '#f87171' },
              { to: 3, suffix: 's', label: 'AVG SCAN TIME', color: '#34d399' },
            ].map(({ to, suffix, label, color }) => (
              <motion.div
                key={label}
                style={{ ...s.statCard, position: 'relative', overflow: 'hidden' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(circle at 50% 0%,${color}10 0%,transparent 60%)`,
                  pointerEvents: 'none',
                }} />
                <span style={{ ...s.statNum, color }}><Counter to={to} suffix={suffix} /></span>
                <span style={s.statLabel}>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div style={s.section}>
          <SectionHeading>Core Capabilities</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            <FeatureCard icon={Shield} label="Advanced Detection" sub="Multi-layer heuristic analysis catches obfuscated and polymorphic malware." color="#60a5fa" delay={0} />
            <FeatureCard icon={Zap} label="Real-time Scanning" sub="Full APK decompilation and behavioral analysis in under 3 seconds." color="#34d399" delay={.1} />
            <FeatureCard icon={Eye} label="Permission Auditing" sub="Every manifest permission classified against known abuse patterns." color="#a78bfa" delay={.2} />
            <FeatureCard icon={Database} label="Static Analysis" sub="Deep bytecode inspection without executing the application." color="#f59e0b" delay={.3} />
            <FeatureCard icon={Cpu} label="AI Behavior Engine" sub="Trained on 500k+ samples to flag novel threat signatures." color="#fb7185" delay={.4} />
            <FeatureCard icon={Lock} label="Zero-day Coverage" sub="Continuously updated threat intelligence database." color="#22d3ee" delay={.5} />
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={s.section}>
          <SectionHeading>How It Works</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              <Step n={1} label="Upload or link your APK" sub="Drag-drop your file or paste a direct download URL. Supports any Android APK up to 200MB." />
              <Step n={2} label="Deep scan initiated" sub="ASTRA decompiles the APK, analyzes bytecode, maps permissions, and runs AI behavioral models." />
              <Step n={3} label="Threat correlation" sub="Results are cross-referenced against a live database of 2.5k+ known malware signatures." />
              <Step n={4} label="Full report generated" sub="Receive a detailed threat report with risk score, flagged code paths, and remediation guidance." last />
            </div>
            {/* Sample report */}
            <div>
              <p style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace', marginBottom: 12, letterSpacing: '0.06em' }}>
                SAMPLE THREAT REPORT
              </p>
              <div style={s.reportCard}>
                <div style={s.reportHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AlertTriangle size={16} color="#f87171" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fca5a5' }}>HIGH THREAT DETECTED</span>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 100,
                    background: 'rgba(239,68,68,.15)', border: '0.5px solid rgba(239,68,68,.3)',
                    color: '#f87171', fontSize: 11, fontFamily: 'monospace',
                  }}>RISK 78%</span>
                </div>
                <div style={s.reportBody}>
                  {[
                    { label: 'Malware Signature', value: 'SMSStealer.B', color: '#f87171' },
                    { label: 'Suspicious Permissions', value: 'SMS · Contacts · Storage', color: '#fb923c' },
                    { label: 'Obfuscation Detected', value: 'Yes — 3 layers', color: '#fbbf24' },
                    { label: 'Network Calls', value: '12 external endpoints', color: '#94a3b8' },
                    { label: 'Certificate', value: 'Self-signed (untrusted)', color: '#94a3b8' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={s.reportRow}>
                      <span style={{ color: '#475569', flex: '0 0 180px' }}>{label}</span>
                      <span style={{ color, fontFamily: 'monospace', fontSize: 12 }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#475569', flex: '0 0 180px' }}>Risk Score</span>
                      <div style={s.riskBar}>
                        <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg,#f59e0b,#ef4444)', borderRadius: 3 }} />
                      </div>
                      <span style={{ color: '#f87171', fontFamily: 'monospace', fontSize: 12 }}>78 / 100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TECH PILLARS ── */}
        <div style={{ ...s.section }}>
          <SectionHeading>Technical Coverage</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { icon: Database, label: 'Static Analysis', sub: 'Bytecode & manifest parsing', color: '#a78bfa' },
              { icon: Shield, label: 'Permission Mapping', sub: 'Full manifest audit', color: '#60a5fa' },
              { icon: AlertTriangle, label: 'Malware Detection', sub: '2.5k+ signature DB', color: '#f87171' },
              { icon: Activity, label: 'API Tracking', sub: 'Outbound call profiling', color: '#34d399' },
            ].map(({ icon: Icon, label, sub, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  background: 'rgba(15,23,42,.7)',
                  border: '0.5px solid rgba(148,163,184,.1)',
                  borderRadius: 10, padding: '20px 18px',
                }}
              >
                <Icon size={18} color={color} style={{ marginBottom: 10 }} />
                <p style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{label}</p>
                <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FOOTER SPACER ── */}
        <div style={{ height: 60 }} />
      </main>
    </div>
  );
}

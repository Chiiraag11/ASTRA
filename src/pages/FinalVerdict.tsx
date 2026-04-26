import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ShieldX, AlertTriangle, Home, RefreshCw, Download,
  ExternalLink, CheckCircle, XCircle, Activity, Eye, Cpu, Globe,
  Lock, Unlock, FileWarning, Terminal, Zap, ChevronRight,
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';

/* ─── Shared atoms ──────────────────────────────────────── */
const ScanLines = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.05) 2px,rgba(0,0,0,.05) 4px)',
  }} />
);

/* ─── Animated counter ──────────────────────────────────── */
const AnimatedNumber = ({ value, color }: { value: number; color: string }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 20);
    const t = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, [value]);
  return <span style={{ color }}>{display}</span>;
};

/* ─── Hex grid decoration ───────────────────────────────── */
const HexGrid = ({ color }: { color: string }) => (
  <svg width="180" height="160" viewBox="0 0 180 160" fill="none" style={{ position: 'absolute', right: -20, top: -20, opacity: 0.07, pointerEvents: 'none' }}>
    {[
      [30,20],[70,20],[110,20],[150,20],
      [10,54],[50,54],[90,54],[130,54],[170,54],
      [30,88],[70,88],[110,88],[150,88],
      [10,122],[50,122],[90,122],[130,122],
    ].map(([cx, cy], i) => (
      <polygon key={i} points={`${cx},${cy-16} ${cx+14},${cy-8} ${cx+14},${cy+8} ${cx},${cy+16} ${cx-14},${cy+8} ${cx-14},${cy-8}`} stroke={color} strokeWidth="0.8" fill="none" />
    ))}
  </svg>
);

/* ─── Risk radar bar ────────────────────────────────────── */
const RiskBar = ({ label, value, max = 100, color, delay = 0 }: { label: string; value: number; max?: number; color: string; delay?: number }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 11, color, fontFamily: 'monospace', fontWeight: 700 }}>{value}%</span>
    </div>
    <div style={{ height: 4, background: 'rgba(148,163,184,.08)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 4 }}
      />
    </div>
  </div>
);

/* ─── MITRE tactic badge ────────────────────────────────── */
const MitreBadge = ({ id, name, color }: { id: string; name: string; color: string }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderRadius: 8,
    background: `${color}0d`, border: `0.5px solid ${color}30`,
  }}>
    <span style={{ fontSize: 10, color, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.06em', flexShrink: 0 }}>{id}</span>
    <span style={{ width: '0.5px', height: 14, background: `${color}30` }} />
    <span style={{ fontSize: 11, color: '#94a3b8' }}>{name}</span>
  </div>
);

/* ─── Timeline event ────────────────────────────────────── */
const TimelineEvent = ({ time, event, severity, isLast }: { time: string; event: string; severity: 'high' | 'medium' | 'low'; isLast: boolean }) => {
  const col = severity === 'high' ? '#f87171' : severity === 'medium' ? '#fbbf24' : '#34d399';
  return (
    <div style={{ display: 'flex', gap: 14, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}70`, marginTop: 2, flexShrink: 0 }} />
        {!isLast && <div style={{ flex: 1, width: '0.5px', background: 'rgba(148,163,184,.1)', marginTop: 4, minHeight: 20 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>{time}</span>
          <span style={{
            fontSize: 10, padding: '1px 7px', borderRadius: 4,
            background: `${col}12`, color: col,
            fontFamily: 'monospace', letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>{severity}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace', lineHeight: 1.5 }}>{event}</p>
      </div>
    </div>
  );
};

/* ─── Section heading ───────────────────────────────────── */
const SectionHeading = ({ children, accent = '#3b82f6', icon: Icon }: { children: React.ReactNode; accent?: string; icon?: React.ElementType }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    {Icon && (
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${accent}15`, border: `0.5px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={accent} />
      </div>
    )}
    <span style={{ width: 3, height: 18, background: accent, borderRadius: 2 }} />
    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '0.02em' }}>{children}</h2>
    <span style={{ flex: 1, height: '0.5px', background: `linear-gradient(90deg,${accent}40,transparent)` }} />
  </div>
);

/* ─── Main ──────────────────────────────────────────────── */
export default function FinalVerdict() {
  const navigate = useNavigate();
  const { state, dispatch } = useScan();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setTimeout(() => setRevealed(true), 300); }, []);

  const score     = state.data.score || 0;
  const isSecure  = score >= 7;
  const vc        = isSecure ? '#34d399' : '#f87171';
  const vcAmber   = '#fbbf24';

  const passed = state.data.results?.filter(r => r.status === 'pass').length || 0;
  const failed = state.data.results?.filter(r => r.status === 'fail').length || 0;
  const total  = (passed + failed) || 1;

  const handleNewScan = () => { dispatch({ type: 'RESET' }); navigate('/'); };
  const handleDownload = (fileName: string, filePath: string) => {
    const a = document.createElement('a');
    a.href = filePath; a.download = fileName; a.click();
  };

  const mitreAttacks = isSecure ? [] : [
    { id: 'T1426', name: 'System Information Discovery', color: '#f87171' },
    { id: 'T1636', name: 'Contact List Access', color: '#f87171' },
    { id: 'T1412', name: 'Capture SMS Messages', color: '#fbbf24' },
    { id: 'T1422', name: 'System Network Config Discovery', color: '#fbbf24' },
    { id: 'T1521', name: 'Encrypted Channel: TLS', color: '#94a3b8' },
  ];

  const behaviorTimeline = isSecure ? [
    { time: '00:00:01', event: 'APK loaded into isolated sandbox', severity: 'low' as const },
    { time: '00:00:03', event: 'Digital signature verified against known CA chain', severity: 'low' as const },
    { time: '00:00:08', event: 'Permission manifest checked — no dangerous permissions', severity: 'low' as const },
    { time: '00:00:12', event: 'Network traffic monitored — no suspicious endpoints', severity: 'low' as const },
    { time: '00:00:18', event: 'Bytecode scan complete — no obfuscation detected', severity: 'low' as const },
  ] : [
    { time: '00:00:02', event: 'APK loaded — excessive permissions requested on install', severity: 'high' as const },
    { time: '00:00:05', event: 'READ_SMS & READ_CONTACTS triggered immediately after launch', severity: 'high' as const },
    { time: '00:00:09', event: 'Outbound connection to 173.194.69.101 established', severity: 'high' as const },
    { time: '00:00:14', event: 'Shared preferences written with device fingerprint data', severity: 'medium' as const },
    { time: '00:00:19', event: 'AppsFlyer SDK initialised — tracking beacon sent', severity: 'medium' as const },
    { time: '00:00:23', event: 'Camera permission silently accessed in background', severity: 'high' as const },
  ];

  const sandboxes = [
    {
      name: 'VirusTotal R2DBox',
      files: [
        '/data/user/0/com.velocredito.in/shared_prefs/com.velocredito.in.xml',
        '/data/user/0/com.velocredito.in/shared_prefs/appsflyer-data.xml',
        '/data/user/0/com.velocredito.in/app_webview/variations_seed_new',
      ],
      permissions: [
        { name: 'android.permission.POST_NOTIFICATIONS', risky: false },
        { name: 'android.permission.INTERNET',           risky: false },
        { name: 'android.permission.CAMERA',             risky: true  },
        { name: 'android.permission.READ_SMS',           risky: true  },
      ],
      verdict: null,
      engine: 'Dynamic · QEMU',
    },
    {
      name: 'Zenbox',
      files: [],
      permissions: [
        { name: 'android.permission.INTERNET',          risky: false },
        { name: 'android.permission.READ_CONTACTS',     risky: true  },
        { name: 'android.permission.READ_SMS',          risky: true  },
        { name: 'android.permission.CAMERA',            risky: true  },
      ],
      verdict: 'Not Clean',
      engine: 'Static · Androguard',
    },
  ];

  const riskDimensions = [
    { label: 'Privacy Exposure',   value: isSecure ? 12 : 87, color: '#f87171' },
    { label: 'Network Threats',    value: isSecure ? 8  : 72, color: '#fb923c' },
    { label: 'Permission Abuse',   value: isSecure ? 5  : 91, color: '#fbbf24' },
    { label: 'Code Obfuscation',   value: isSecure ? 3  : 58, color: '#a78bfa' },
    { label: 'Sandbox Evasion',    value: isSecure ? 2  : 44, color: '#60a5fa' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#020817 0%,#080f20 50%,#020817 100%)',
      fontFamily: '"Inter","SF Pro Display",-apple-system,sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes scanline { 0%{top:-8%} 100%{top:108%} }
        .dl-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .action-btn:hover { filter: brightness(1.1); }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle,${vc}06 0%,transparent 65%)`, top: -250, left: -250, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.05) 0%,transparent 70%)', bottom: -150, right: -150, pointerEvents: 'none', zIndex: 0 }} />

      {/* Animated scan line */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${vc}18,transparent)`, pointerEvents: 'none', zIndex: 2, animation: 'scanline 6s linear infinite' }} />

      <ScanLines />
      <Header />

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* ══════════════════════════════════════════
            HERO VERDICT PANEL
        ══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: 'rgba(10,15,30,.95)',
            border: `0.5px solid ${vc}30`,
            borderRadius: 18,
          }}>
            {/* Top accent strip with gradient */}
            <div style={{ height: 3, background: `linear-gradient(90deg,${vc},${vc}40,transparent)` }} />

            {/* Hex background decoration */}
            <HexGrid color={vc} />

            <div style={{ padding: '36px 40px', display: 'flex', gap: 36, alignItems: 'center', position: 'relative' }}>
              {/* Animated shield icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
                style={{
                  width: 88, height: 88, borderRadius: 22, flexShrink: 0,
                  background: `${vc}12`, border: `1px solid ${vc}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    position: 'absolute', inset: -8, borderRadius: 30,
                    border: `1px solid ${vc}40`,
                  }}
                />
                {isSecure
                  ? <ShieldCheck size={40} color={vc} />
                  : <ShieldX size={40} color={vc} />
                }
              </motion.div>

              {/* Verdict text */}
              <div style={{ flex: 1 }}>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{
                      padding: '4px 14px', borderRadius: 100, fontSize: 10,
                      background: `${vc}15`, border: `0.5px solid ${vc}40`,
                      color: vc, fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700,
                    }}>
                      {isSecure ? '✓ VERDICT: SAFE' : '⚠ VERDICT: THREAT DETECTED'}
                    </span>
                    <span style={{
                      padding: '4px 10px', borderRadius: 100, fontSize: 10,
                      background: 'rgba(148,163,184,.06)', border: '0.5px solid rgba(148,163,184,.12)',
                      color: '#475569', fontFamily: 'monospace', letterSpacing: '0.06em',
                    }}>
                      SCAN ID · {Math.random().toString(36).slice(2,8).toUpperCase()}
                    </span>
                  </div>
                  <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {isSecure ? 'Application Appears Secure' : 'Malicious Activity Detected'}
                  </h1>
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.7, maxWidth: 480 }}>
                    {isSecure
                      ? 'No significant threats identified across all scan dimensions. Standard security practices still apply — review permissions before granting access.'
                      : 'This APK exhibits multiple high-severity threat indicators including unauthorized data exfiltration, dangerous permissions abuse, and suspicious network activity. Do not install.'}
                  </p>
                </motion.div>
              </div>

              {/* Score donut */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                style={{ flexShrink: 0, textAlign: 'center' }}
              >
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(148,163,184,.08)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none" stroke={vc} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (score / 10) * 251.2 }}
                      transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: vc, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>/10</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em', marginTop: 6, display: 'block' }}>SECURITY SCORE</span>
              </motion.div>
            </div>

            {/* Bottom stat strip */}
            <div style={{
              borderTop: '0.5px solid rgba(148,163,184,.08)',
              padding: '14px 40px',
              display: 'flex', gap: 0,
              background: 'rgba(0,0,0,.2)',
            }}>
              {[
                { label: 'Checks Run',   value: total,  color: '#94a3b8' },
                { label: 'Passed',       value: passed, color: '#34d399' },
                { label: 'Failed',       value: failed, color: '#f87171' },
                { label: 'Risk Level',   value: isSecure ? 'LOW' : 'HIGH', color: vc, isText: true },
                { label: 'Scan Type',    value: (state.data.scanType || 'Quick').toUpperCase(), color: '#60a5fa', isText: true },
              ].map(({ label, value, color, isText }, i) => (
                <React.Fragment key={label}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: isText ? 14 : 20, fontWeight: 800, color, letterSpacing: isText ? '0.06em' : '-0.02em', lineHeight: 1, marginBottom: 4 }}>
                      {isText ? value : <AnimatedNumber value={value as number} color={color} />}
                    </div>
                    <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{label.toUpperCase()}</div>
                  </div>
                  {i < 4 && <div style={{ width: '0.5px', background: 'rgba(148,163,184,.08)', alignSelf: 'stretch' }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            THREE-COLUMN MIDDLE ROW
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>

          {/* Risk Dimensions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 18px' }}>
            <SectionHeading accent="#a78bfa" icon={Activity}>Risk Dimensions</SectionHeading>
            {riskDimensions.map((d, i) => (
              <RiskBar key={d.label} label={d.label} value={d.value} color={d.color} delay={0.3 + i * 0.1} />
            ))}
          </motion.div>

          {/* AI Model */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 18px' }}>
            <SectionHeading accent="#60a5fa" icon={Cpu}>AI Model Prediction</SectionHeading>

            <div style={{
              background: isSecure ? 'rgba(52,211,153,.06)' : 'rgba(248,113,113,.06)',
              border: `0.5px solid ${isSecure ? 'rgba(52,211,153,.2)' : 'rgba(248,113,113,.2)'}`,
              borderRadius: 10, padding: '14px 16px', marginBottom: 14,
            }}>
              <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 6 }}>CLASSIFICATION</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: vc, letterSpacing: '-0.01em' }}>
                {isSecure ? 'Benign' : 'Malicious'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>
                Confidence: <span style={{ color: vc }}>{isSecure ? '91.2%' : '78.44%'}</span>
              </div>
            </div>

            {[
              { label: 'Model', value: 'ASTRA-v2 XGBoost' },
              { label: 'Features', value: '247 extracted' },
              { label: 'Dataset', value: '4.2M APK samples' },
              { label: 'Accuracy', value: '98.7% on test set' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(148,163,184,.05)' }}>
                <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{label}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </motion.div>

          {/* Meta info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 18px' }}>
            <SectionHeading accent="#34d399" icon={FileWarning}>File Metadata</SectionHeading>
            {[
              { label: 'APK File',       value: 'VeloCredit_release_latest.apk' },
              { label: 'File Size',      value: '18.6 MB' },
              { label: 'Package',        value: 'com.velocredito.in' },
              { label: 'Min SDK',        value: 'Android 5.0 (API 21)' },
              { label: 'Target SDK',     value: 'Android 13 (API 33)' },
              { label: 'Cert Valid',     value: isSecure ? 'Yes' : 'Unverified' },
              { label: 'Obfuscated',     value: isSecure ? 'No' : 'Partial (ProGuard)' },
              { label: 'IP Contacted',   value: '173.194.69.101' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', borderBottom: '0.5px solid rgba(148,163,184,.05)', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 11, color: label === 'IP Contacted' ? '#fca5a5' : label === 'Cert Valid' && !isSecure ? '#fbbf24' : '#94a3b8', fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════
            BEHAVIOR TIMELINE + MITRE
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

          {/* Behavior Timeline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 6px' }}>
            <SectionHeading accent="#fbbf24" icon={Terminal}>Behavior Timeline</SectionHeading>
            {behaviorTimeline.map((ev, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}>
                <TimelineEvent {...ev} isLast={i === behaviorTimeline.length - 1} />
              </motion.div>
            ))}
          </motion.div>

          {/* MITRE ATT&CK + Sandbox Verdicts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* MITRE */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '20px 22px', flex: mitreAttacks.length > 0 ? 1 : 'none' }}>
              <SectionHeading accent="#f87171" icon={Eye}>MITRE ATT&CK Mapping</SectionHeading>
              {mitreAttacks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {mitreAttacks.map(m => <MitreBadge key={m.id} {...m} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 9, background: 'rgba(52,211,153,.04)', border: '0.5px solid rgba(52,211,153,.15)' }}>
                  <CheckCircle size={16} color="#34d399" />
                  <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>No ATT&CK tactics identified</span>
                </div>
              )}
            </motion.div>

            {/* Sandbox quick verdicts */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '20px 22px' }}>
              <SectionHeading accent="#60a5fa" icon={Globe}>Sandbox Engines</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sandboxes.map((sb) => (
                  <div key={sb.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 9,
                    background: 'rgba(0,0,0,.2)', border: '0.5px solid rgba(148,163,184,.08)',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{sb.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>{sb.engine}</p>
                    </div>
                    {sb.verdict ? (
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'rgba(248,113,113,.1)', border: '0.5px solid rgba(248,113,113,.25)', color: '#f87171', fontFamily: 'monospace', fontWeight: 700 }}>
                        {sb.verdict.toUpperCase()}
                      </span>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'rgba(52,211,153,.08)', border: '0.5px solid rgba(52,211,153,.2)', color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>
                        CLEAN
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SANDBOX DEEP DIVE
        ══════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ marginBottom: 20 }}>
          <div style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 26px' }}>
            <SectionHeading accent="#a78bfa" icon={Lock}>Deep Sandbox Analysis</SectionHeading>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {sandboxes.map((sb, idx) => (
                <motion.div key={sb.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 + idx * 0.1 }}
                  style={{ background: 'rgba(0,0,0,.25)', border: '0.5px solid rgba(148,163,184,.08)', borderRadius: 11, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>{sb.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>{sb.engine}</p>
                    </div>
                    {sb.verdict
                      ? <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'rgba(248,113,113,.1)', border: '0.5px solid rgba(248,113,113,.25)', color: '#f87171', fontFamily: 'monospace' }}>{sb.verdict.toUpperCase()}</span>
                      : <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'rgba(148,163,184,.06)', border: '0.5px solid rgba(148,163,184,.15)', color: '#475569', fontFamily: 'monospace' }}>NO VERDICT</span>
                    }
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>FILES WRITTEN</span>
                      {sb.files.length > 0 ? sb.files.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0' }}>
                          <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#f87171', flexShrink: 0, marginTop: 5 }} />
                          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', lineHeight: 1.5, wordBreak: 'break-all' }}>{f}</span>
                        </div>
                      )) : (
                        <span style={{ fontSize: 11, color: '#334155', fontStyle: 'italic' }}>None recorded</span>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>PERMISSIONS</span>
                      {sb.permissions.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                          {p.risky
                            ? <XCircle size={11} color="#f87171" style={{ flexShrink: 0 }} />
                            : <CheckCircle size={11} color="#334155" style={{ flexShrink: 0 }} />
                          }
                          <span style={{ fontSize: 10, color: p.risky ? '#fca5a5' : '#475569', fontFamily: 'monospace', lineHeight: 1.5 }}>
                            {p.name.replace('android.permission.', '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            OFFICIAL SOURCE + DOWNLOADS + ACTIONS
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>

          {/* Official source */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
            <div style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(52,211,153,.15)', borderRadius: 14, padding: '20px 22px' }}>
              <SectionHeading accent="#34d399" icon={Unlock}>Official Source</SectionHeading>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, margin: '0 0 4px' }}>Download from the official store only</p>
                  <p style={{ color: '#334155', fontSize: 11, margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>play.google.com/store/search?q=sbi+yono</p>
                </div>
                <a
  href="https://play.google.com/store/search?q=sbi+yono+app&c=apps&hl=en"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 16px',
    borderRadius: 9,
    background: 'rgba(52,211,153,.1)',
    border: '0.5px solid rgba(52,211,153,.3)',
    color: '#34d399',
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
    flexShrink: 0,
    transition: 'all .2s',
  }}
>
  <ExternalLink size={13} />
  Open
</a>
              </div>
            </div>
          </motion.div>

          {/* Download reports */}
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8 }}
>
  <div
    style={{
      background: 'rgba(10,15,30,.9)',
      border: '0.5px solid rgba(148,163,184,.1)',
      borderRadius: 14,
      padding: '20px 22px',
    }}
  >
    <SectionHeading accent="#60a5fa" icon={Download}>
      Download Report
    </SectionHeading>

    <div style={{ display: 'flex', gap: 10 }}>
      {[
        {
          label: 'PDF Report',
          file: 'ASTRA_APK_Security_Report-1.pdf',
          path: '/ASTRA_APK_Security_Report-1.pdf',
          accent: '#60a5fa',
        },
        {
          label: 'JSON Data',
          file: 'report.json',
          path: '/report.json',
          accent: '#a78bfa',
        },
      ].map(({ label, file, path, accent }) => {
        return (
          <button
            key={label}
            className="dl-btn"
            onClick={() => handleDownload(file, path)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 0',
              borderRadius: 9,
              background: `${accent}10`,
              border: `0.5px solid ${accent}30`,
              color: accent,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all .2s',
            }}
          >
            <Download size={13} />
            {label}
          </button>
        );
      })}
    </div>
  </div>
</motion.div>
</div>

        {/* ── Action buttons ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="action-btn"
            onClick={handleNewScan}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '13px 26px', borderRadius: 10,
              background: 'rgba(15,23,42,.7)', border: '0.5px solid rgba(148,163,184,.15)',
              color: '#94a3b8', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <RefreshCw size={14} />
            Scan Another APK
          </button>
          <button
            className="action-btn"
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '13px 26px', borderRadius: 10,
              background: 'rgba(59,130,246,.15)', border: '0.5px solid rgba(59,130,246,.4)',
              color: '#60a5fa', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <Home size={14} />
            Back to Home
            <ChevronRight size={14} />
          </button>
        </motion.div>

        {/* Footer note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: '#1e293b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          ANALYSIS CONDUCTED IN ISOLATED SANDBOX · REPORT GENERATED BY ASTRA SECURITY ENGINE v2.0
        </motion.p>

      </main>
    </div>
  );
}
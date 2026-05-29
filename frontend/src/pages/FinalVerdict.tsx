import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ShieldX, AlertTriangle, Home, RefreshCw,
  CheckCircle, XCircle, Activity, Eye, Cpu, Globe,
  Lock, FileWarning, Terminal, Zap, ChevronRight, Info,
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';

const ScanLines = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.05) 2px,rgba(0,0,0,.05) 4px)',
  }} />
);

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

const RiskBar = ({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 11, color, fontFamily: 'monospace', fontWeight: 700 }}>{value}%</span>
    </div>
    <div style={{ height: 4, background: 'rgba(148,163,184,.08)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 4 }}
      />
    </div>
  </div>
);

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

const HexGrid = ({ color }: { color: string }) => (
  <svg width="180" height="160" viewBox="0 0 180 160" fill="none" style={{ position: 'absolute', right: -20, top: -20, opacity: 0.07, pointerEvents: 'none' }}>
    {[[30,20],[70,20],[110,20],[150,20],[10,54],[50,54],[90,54],[130,54],[170,54],[30,88],[70,88],[110,88],[150,88],[10,122],[50,122],[90,122],[130,122]].map(([cx, cy], i) => (
      <polygon key={i} points={`${cx},${cy-16} ${cx+14},${cy-8} ${cx+14},${cy+8} ${cx},${cy+16} ${cx-14},${cy+8} ${cx-14},${cy-8}`} stroke={color} strokeWidth="0.8" fill="none" />
    ))}
  </svg>
);

function formatBytes(bytes: number): string {
  if (!bytes) return 'N/A';
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FinalVerdict() {
  const navigate = useNavigate();
  const { state, dispatch } = useScan();
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setTimeout(() => setRevealed(true), 300); }, []);

  const metadata = state.data.metadata;
  const risk     = state.data.risk;
  const urlResult = state.data.urlScanResult;
  const backendErr = state.data.backendError;

  // Determine score and verdict from real data or fallback to scan results
  const riskScore = risk?.risk_score ?? (urlResult?.risk_score) ?? state.data.score ?? 0;
  const rawVerdict = risk?.verdict ?? urlResult?.verdict;
  const isMalicious  = rawVerdict === 'Malicious' || (!rawVerdict && riskScore < 4 * 10);
  const isSuspicious = rawVerdict === 'Suspicious';
  const isSecure     = rawVerdict === 'Safe' || (!rawVerdict && riskScore >= 7 * 10);

  // Normalize score to /10 if it's 0-100
  const score10 = riskScore > 10 ? Math.round((100 - riskScore) / 10) : (state.data.score ?? 5);

  const vc = isSecure ? '#34d399' : isSuspicious ? '#fbbf24' : '#f87171';
  const verdictLabel = isSecure ? 'SAFE' : isSuspicious ? 'SUSPICIOUS' : 'MALICIOUS';
  const verdictTitle = isSecure ? 'Application Appears Secure' : isSuspicious ? 'Suspicious Activity Detected' : 'Malicious Activity Detected';
  const verdictDesc  = isSecure
    ? 'No significant threats identified. Standard security practices still apply — review permissions before granting access.'
    : isSuspicious
    ? 'This app shows some suspicious traits. Verify the developer identity and review permissions carefully before installing.'
    : 'This APK exhibits multiple high-severity threat indicators including dangerous permissions, suspicious behavior, and potential impersonation. Do not install.';

  const passed = state.data.results?.filter(r => r.status === 'pass').length ?? 0;
  const failed = state.data.results?.filter(r => r.status === 'fail').length ?? 0;
  const total  = (passed + failed) || 1;

  const handleNewScan = () => { dispatch({ type: 'RESET' }); navigate('/'); };

  // Risk dimensions from real data
  const riskDimensions = [
    { label: 'Permission Abuse',  value: Math.min(100, risk?.permission_score ?? (isSecure ? 5 : 75)),  color: '#fbbf24' },
    { label: 'Package Suspicion', value: Math.min(100, risk?.package_score ?? (isSecure ? 5 : 55)),     color: '#fb923c' },
    { label: 'Signature Risk',    value: Math.min(100, (risk?.signature_score ?? 0) > 0 ? 80 : 5),     color: '#f87171' },
    { label: 'Behavior Signals',  value: Math.min(100, risk?.behavior_score ?? (isSecure ? 5 : 45)),    color: '#a78bfa' },
    { label: 'Overall Risk',      value: riskScore > 10 ? riskScore : riskScore * 10,                    color: vc },
  ];

  const dangerousPerms = risk?.dangerous_permissions ?? [];
  const flags = risk?.flags ?? urlResult?.flags ?? [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#020817 0%,#080f20 50%,#020817 100%)', fontFamily: '"Inter","SF Pro Display",-apple-system,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes scanline { 0%{top:-8%} 100%{top:108%} }
        .action-btn:hover { filter: brightness(1.1); }
      `}</style>

      <div style={{ position: 'fixed', width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle,${vc}06 0%,transparent 65%)`, top: -250, left: -250, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.05) 0%,transparent 70%)', bottom: -150, right: -150, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${vc}18,transparent)`, pointerEvents: 'none', zIndex: 2, animation: 'scanline 6s linear infinite' }} />
      <ScanLines />
      <Header />

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Backend error notice */}
        {backendErr && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 10, marginBottom: 20, background: 'rgba(251,191,36,.06)', border: '0.5px solid rgba(251,191,36,.2)' }}>
            <Info size={14} color="#fbbf24" />
            <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>Backend unavailable — showing simulated results. Start the Python backend for real analysis.</span>
          </motion.div>
        )}

        {/* ── Hero Verdict Panel ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative', overflow: 'hidden', background: 'rgba(10,15,30,.95)', border: `0.5px solid ${vc}30`, borderRadius: 18 }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,${vc},${vc}40,transparent)` }} />
            <HexGrid color={vc} />
            <div style={{ padding: '36px 40px', display: 'flex', gap: 36, alignItems: 'center', position: 'relative' }}>
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
                style={{ width: 88, height: 88, borderRadius: 22, flexShrink: 0, background: `${vc}12`, border: `1px solid ${vc}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ position: 'absolute', inset: -8, borderRadius: 30, border: `1px solid ${vc}40` }} />
                {isSecure ? <ShieldCheck size={40} color={vc} /> : <ShieldX size={40} color={vc} />}
              </motion.div>

              <div style={{ flex: 1 }}>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 14px', borderRadius: 100, fontSize: 10, background: `${vc}15`, border: `0.5px solid ${vc}40`, color: vc, fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
                      {isSecure ? '✓' : '⚠'} VERDICT: {verdictLabel}
                    </span>
                    {metadata && (
                      <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 10, background: 'rgba(148,163,184,.06)', border: '0.5px solid rgba(148,163,184,.12)', color: '#475569', fontFamily: 'monospace' }}>
                        {metadata.package_name}
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{verdictTitle}</h1>
                  <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.7, maxWidth: 480 }}>{verdictDesc}</p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(148,163,184,.08)" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="40" fill="none" stroke={vc} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={251.2} initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (score10 / 10) * 251.2 }}
                      transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: vc, letterSpacing: '-0.04em', lineHeight: 1 }}>{score10}</span>
                    <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>/10</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em', marginTop: 6, display: 'block' }}>SECURITY SCORE</span>
              </motion.div>
            </div>

            <div style={{ borderTop: '0.5px solid rgba(148,163,184,.08)', padding: '14px 40px', display: 'flex', gap: 0, background: 'rgba(0,0,0,.2)' }}>
              {[
                { label: 'Risk Score',   value: `${riskScore > 10 ? riskScore : riskScore * 10}/100`, color: vc,         isText: true },
                { label: 'Verdict',      value: verdictLabel,                                          color: vc,         isText: true },
                { label: 'Scan Type',    value: (state.data.scanType || 'quick').toUpperCase(),        color: '#60a5fa',  isText: true },
                { label: 'Flags Found',  value: flags.length,                                          color: '#fbbf24',  isText: false },
                { label: 'Checks Run',   value: total,                                                 color: '#94a3b8',  isText: false },
              ].map(({ label, value, color, isText }, i) => (
                <React.Fragment key={label}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: isText ? 13 : 20, fontWeight: 800, color, letterSpacing: isText ? '0.06em' : '-0.02em', lineHeight: 1, marginBottom: 4 }}>
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

        {/* ── 3-column row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>

          {/* Risk Dimensions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 18px' }}>
            <SectionHeading accent="#a78bfa" icon={Activity}>Risk Dimensions</SectionHeading>
            {riskDimensions.map((d, i) => (
              <RiskBar key={d.label} label={d.label} value={d.value} color={d.color} delay={0.3 + i * 0.1} />
            ))}
          </motion.div>

          {/* App Metadata */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 18px' }}>
            <SectionHeading accent="#34d399" icon={FileWarning}>File Metadata</SectionHeading>
            {metadata ? (
              [
                { label: 'App Name',    value: metadata.app_name || '—' },
                { label: 'Package',     value: metadata.package_name },
                { label: 'File',        value: metadata.file_name },
                { label: 'Size',        value: formatBytes(metadata.apk_size_bytes) },
                { label: 'Min SDK',     value: metadata.min_sdk ? `API ${metadata.min_sdk}` : '—' },
                { label: 'Target SDK',  value: metadata.target_sdk ? `API ${metadata.target_sdk}` : '—' },
                { label: 'Version',     value: metadata.version_name || '—' },
                { label: 'Signed',      value: metadata.signatures.length > 0 ? 'Yes' : 'No ⚠' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 0', borderBottom: '0.5px solid rgba(148,163,184,.05)', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 11, color: (label === 'Signed' && value.includes('No')) ? '#fbbf24' : '#94a3b8', fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace' }}>No real APK metadata — backend returned demo data.</p>
            )}
          </motion.div>

          {/* AI / Risk Scoring */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 18px' }}>
            <SectionHeading accent="#60a5fa" icon={Cpu}>Risk Engine</SectionHeading>
            <div style={{ background: isSecure ? 'rgba(52,211,153,.06)' : isSuspicious ? 'rgba(251,191,36,.06)' : 'rgba(248,113,113,.06)', border: `0.5px solid ${vc}30`, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 6 }}>CLASSIFICATION</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: vc }}>{verdictLabel}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>Risk Score: <span style={{ color: vc }}>{riskScore > 10 ? riskScore : riskScore * 10}/100</span></div>
            </div>
            {[
              { label: 'Engine',        value: 'ASTRA Rule Engine v2' },
              { label: 'Perm. Score',   value: `${risk?.permission_score ?? '—'}/80` },
              { label: 'Package Score', value: `${risk?.package_score ?? '—'}/40` },
              { label: 'Sig. Score',    value: `${risk?.signature_score ?? '—'}/25` },
              { label: 'Behavior',      value: `${risk?.behavior_score ?? '—'}/40` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid rgba(148,163,184,.05)' }}>
                <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{label}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Dangerous Permissions + Flags ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

          {/* Dangerous Permissions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 16px' }}>
            <SectionHeading accent="#f87171" icon={Lock}>Dangerous Permissions</SectionHeading>
            {dangerousPerms.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {dangerousPerms.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, background: 'rgba(248,113,113,.05)', border: '0.5px solid rgba(248,113,113,.15)' }}>
                    <XCircle size={12} color="#f87171" />
                    <span style={{ fontSize: 11, color: '#fca5a5', fontFamily: 'monospace' }}>{p.replace('android.permission.', '')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 9, background: 'rgba(52,211,153,.04)', border: '0.5px solid rgba(52,211,153,.15)' }}>
                <CheckCircle size={16} color="#34d399" />
                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>No dangerous permissions detected</span>
              </div>
            )}
          </motion.div>

          {/* Risk Flags */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 22px 16px' }}>
            <SectionHeading accent="#fbbf24" icon={Terminal}>Risk Flags</SectionHeading>
            {flags.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {flags.map((flag, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(251,191,36,.05)', border: '0.5px solid rgba(251,191,36,.15)' }}>
                    <AlertTriangle size={12} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 11, color: '#fcd34d', fontFamily: 'monospace', lineHeight: 1.5 }}>{flag}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 9, background: 'rgba(52,211,153,.04)', border: '0.5px solid rgba(52,211,153,.15)' }}>
                <CheckCircle size={16} color="#34d399" />
                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>No risk flags raised</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Services & Activities ── */}
        {metadata && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={{ marginBottom: 20 }}>
            <div style={{ background: 'rgba(10,15,30,.9)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '22px 26px' }}>
              <SectionHeading accent="#60a5fa" icon={Globe}>App Components</SectionHeading>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Services',   items: metadata.services,   color: '#60a5fa' },
                  { label: 'Receivers',  items: metadata.receivers,  color: '#a78bfa' },
                  { label: 'Activities', items: metadata.activities, color: '#34d399' },
                ].map(({ label, items, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color, fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 10 }}>{label.toUpperCase()} · {items.length}</div>
                    <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {items.length > 0 ? items.map((item, i) => (
                        <div key={i} style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', lineHeight: 1.5, wordBreak: 'break-all' }}>
                          {item.split('.').pop()}
                        </div>
                      )) : <span style={{ fontSize: 11, color: '#334155', fontStyle: 'italic' }}>None</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Action buttons ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
          <button className="action-btn" onClick={handleNewScan}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 26px', borderRadius: 10, background: 'rgba(15,23,42,.7)', border: '0.5px solid rgba(148,163,184,.15)', color: '#94a3b8', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>
            <RefreshCw size={14} />Scan Another APK
          </button>
          <button className="action-btn" onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 26px', borderRadius: 10, background: 'rgba(59,130,246,.15)', border: '0.5px solid rgba(59,130,246,.4)', color: '#60a5fa', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>
            <Home size={14} />Back to Home<ChevronRight size={14} />
          </button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: '#1e293b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          ANALYSIS CONDUCTED BY ASTRA SECURITY ENGINE v2.0
        </motion.p>
      </main>
    </div>
  );
}

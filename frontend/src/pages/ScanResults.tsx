import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, Shield, AlertTriangle, Activity } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';

const ScanLines = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)',
  }} />
);

const ScoreRing = ({ score, color }: { score: number; color: string }) => {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 10) * circ;
  return (
    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,.1)" strokeWidth="7" />
        <motion.circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - fill }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</span>
        <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.06em' }}>/10</span>
      </div>
    </div>
  );
};

const ThreatBanner = ({ score }: { score: number }) => {
  const level = score >= 7
    ? { label: 'Low Threat', desc: 'App appears safe to install', color: '#34d399', bg: 'rgba(52,211,153,.07)', border: 'rgba(52,211,153,.25)', Icon: Shield }
    : score >= 4
    ? { label: 'Medium Threat', desc: 'Proceed with caution', color: '#fbbf24', bg: 'rgba(251,191,36,.07)', border: 'rgba(251,191,36,.25)', Icon: AlertTriangle }
    : { label: 'High Threat', desc: 'Significant risks detected', color: '#f87171', bg: 'rgba(248,113,113,.07)', border: 'rgba(248,113,113,.25)', Icon: AlertTriangle };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 10, background: level.bg, border: `0.5px solid ${level.border}`, marginTop: 16 }}>
      <level.Icon size={20} color={level.color} />
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: level.color }}>{level.label}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{level.desc}</p>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ width: 6, height: 20, borderRadius: 3, background: (score >= 7 ? i <= 2 : score >= 4 ? i <= 3 : i <= 5) ? level.color : 'rgba(148,163,184,.1)', transition: 'background .3s' }} />
        ))}
      </div>
    </motion.div>
  );
};

type Status = 'pending' | 'pass' | 'fail';

const CheckpointRow = ({ name, description, status, index, isLast }: { name: string; description: string; status: Status; index: number; isLast: boolean }) => {
  const cfg = {
    pass:    { dot: '#34d399', icon: <CheckCircle size={14} color="#34d399" />, label: 'PASS', labelColor: '#34d399', rowBg: 'rgba(52,211,153,.03)',  rowBorder: 'rgba(52,211,153,.12)' },
    fail:    { dot: '#f87171', icon: <XCircle size={14} color="#f87171" />,    label: 'FAIL', labelColor: '#f87171', rowBg: 'rgba(248,113,113,.04)', rowBorder: 'rgba(248,113,113,.15)' },
    pending: { dot: '#334155', icon: <Clock size={14} color="#475569" />,       label: 'WAIT', labelColor: '#334155', rowBg: 'rgba(15,23,42,.4)',     rowBorder: 'rgba(148,163,184,.08)' },
  }[status];

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} style={{ display: 'flex', gap: 0, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.05 + 0.1 }} style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 14, flexShrink: 0, background: cfg.dot, boxShadow: status !== 'pending' ? `0 0 8px ${cfg.dot}60` : 'none' }} />
        {!isLast && <div style={{ flex: 1, width: 1, minHeight: 12, background: status !== 'pending' ? `linear-gradient(180deg,${cfg.dot}50,rgba(148,163,184,.1))` : 'rgba(148,163,184,.08)', marginTop: 3 }} />}
      </div>
      <div style={{ flex: 1, marginBottom: 6, marginLeft: 8, padding: '11px 16px', borderRadius: 9, background: cfg.rowBg, border: `0.5px solid ${cfg.rowBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#cbd5e1', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{description}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {status === 'pending' && <div style={{ width: 12, height: 12, border: '1.5px solid #475569', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
          {status !== 'pending' && cfg.icon}
          <span style={{ fontSize: 10, color: cfg.labelColor, fontFamily: 'monospace', letterSpacing: '0.08em', fontWeight: 700 }}>{cfg.label}</span>
        </div>
      </div>
    </motion.div>
  );
};

const allCheckpoints = [
  { id: 'signature',        name: 'Digital Signature',   description: 'Verifying app authenticity and publisher credentials' },
  { id: 'permissions',      name: 'Permission Analysis',  description: 'Analyzing requested permissions' },
  { id: 'malware',          name: 'Malware Detection',    description: 'Scanning for malicious code' },
  { id: 'network',          name: 'Network Behavior',     description: 'Checking suspicious network comms' },
  { id: 'androguard',       name: 'Androguard Analysis',  description: 'Static reverse engineering of APK' },
  { id: 'model-prediction', name: 'AI Model Prediction',  description: 'ML risk scoring' },
  { id: 'vt-antivirus',     name: 'VirusTotal AV Scan',   description: 'Multi-engine AV results' },
  { id: 'vt-sandbox',       name: 'VT Sandbox',           description: 'Dynamic sandbox results' },
  { id: 'mitre',            name: 'MITRE ATT&CK Mapping', description: 'Mapping to ATT&CK tactics' },
  { id: 'sandbox',          name: 'Custom Sandbox',       description: 'Dynamic malware behavior analysis' },
];

const quickIds  = ['signature', 'permissions', 'malware', 'network'];
const quickCPs  = allCheckpoints.filter(c => quickIds.includes(c.id));
const deepCPs   = allCheckpoints.filter(c => !quickIds.includes(c.id));
const customCPs = allCheckpoints;

export default function ScanResults() {
  const navigate = useNavigate();
  const { state, dispatch } = useScan();
  const scanType = state.data.scanType?.toLowerCase();

  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);

  // ✅ FIX 5: Custom scan runs only selected checks
  const checkpoints =
    scanType === 'quick'
      ? quickCPs
      : scanType === 'deep'
      ? deepCPs
      : customCPs.filter(c => selectedChecks.includes(c.id));

  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [results, setResults] = useState(checkpoints.map(cp => ({ ...cp, status: 'pending' as Status })));
  const [score, setScore] = useState(0);

  // Reset results when checkpoints change (custom scan selection changes)
  useEffect(() => {
    setResults(checkpoints.map(cp => ({ ...cp, status: 'pending' as Status })));
    setCurrentCheckpoint(0);
    setScore(0);
  }, [selectedChecks]);

  useEffect(() => {
    // ✅ FIX 2 & 3: No early return for deep or custom — all scan types animate step-by-step
    if (checkpoints.length === 0) return;

    const timer = setInterval(() => {
      if (currentCheckpoint < checkpoints.length) {
        const updated = [...results];
        updated[currentCheckpoint] = { ...updated[currentCheckpoint], status: Math.random() > 0.3 ? 'pass' : 'fail' };
        setResults(updated);
        setCurrentCheckpoint(p => p + 1);
        const done = updated.filter(r => r.status !== 'pending');
        if (done.length > 0) setScore(Math.round((done.filter(r => r.status === 'pass').length / done.length) * 10));
      } else {
        clearInterval(timer);
        const final = Math.round((results.filter(r => r.status === 'pass').length / results.length) * 10);
        dispatch({ type: 'UPDATE_RESULTS', payload: results });
        dispatch({ type: 'SET_SCORE', payload: final });
        setScore(final);
      }
    }, 800);
    return () => clearInterval(timer);
  }, [currentCheckpoint, checkpoints.length]);

  const completed = results.filter(r => r.status !== 'pending').length;
  const progress  = checkpoints.length > 0 ? (completed / checkpoints.length) * 100 : 0;
  const passed    = results.filter(r => r.status === 'pass').length;
  const failed    = results.filter(r => r.status === 'fail').length;

  // ✅ FIX 4: isDone no longer short-circuits for custom
  const isDone = completed === checkpoints.length && checkpoints.length > 0;

  const scoreColor = score >= 7 ? '#34d399' : score >= 4 ? '#fbbf24' : '#f87171';

  const toggleCheck = (id: string) =>
    setSelectedChecks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#020817 0%,#0a0f1e 50%,#020817 100%)', fontFamily: '"Inter","SF Pro Display",-apple-system,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
        .proceed-btn:hover { background: rgba(59,130,246,.25) !important; border-color: rgba(59,130,246,.7) !important; }
        .check-label:hover { border-color: rgba(59,130,246,.3) !important; background: rgba(59,130,246,.04) !important; }
      `}</style>

      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.06) 0%,transparent 70%)', top: -200, left: -200, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.05) 0%,transparent 70%)', bottom: -150, right: -150, pointerEvents: 'none', zIndex: 0 }} />
      <ScanLines />
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start', marginBottom: 36 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ width: 3, height: 28, background: '#3b82f6', borderRadius: 2, flexShrink: 0 }} />
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e2e8f0', margin: 0, letterSpacing: '-0.02em' }}>Security Analysis</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 15 }}>
              {!isDone ? (
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #60a5fa', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              )}
              <span style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                {isDone ? 'SCAN COMPLETE' : `RUNNING ${(scanType ?? '').toUpperCase()} SCAN`}
              </span>
              {!isDone && checkpoints.length > 0 && (
                <span style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'monospace', animation: 'shimmer 1.5s ease-in-out infinite' }}>
                  {completed}/{checkpoints.length}
                </span>
              )}
            </div>
            {isDone && scanType !== 'custom' && <ThreatBanner score={score} />}
          </motion.div>

          {scanType !== 'custom' && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ background: 'rgba(15,23,42,.85)', border: `0.5px solid ${scoreColor}30`, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <ScoreRing score={score} color={scoreColor} />
              <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.07em' }}>SECURITY SCORE</span>
            </motion.div>
          )}
        </div>

        {scanType !== 'custom' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
              {checkpoints.map((_, i) => {
                const s = results[i]?.status ?? 'pending';
                return (
                  <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.04 }} style={{ flex: 1, height: 5, borderRadius: 3, background: s === 'pass' ? '#34d399' : s === 'fail' ? '#f87171' : 'rgba(148,163,184,.1)', transformOrigin: 'bottom', transition: 'background .3s' }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {[
                { label: 'Completed', value: completed, color: '#94a3b8' },
                { label: 'Passed',    value: passed,    color: '#34d399' },
                { label: 'Failed',    value: failed,    color: '#f87171' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, background: 'rgba(15,23,42,.6)', border: '0.5px solid rgba(148,163,184,.08)' }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color }}>{value}</span>
                  <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{label.toUpperCase()}</span>
                </div>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace' }}>{Math.round(progress)}% complete</span>
            </div>
          </motion.div>
        )}

        {scanType !== 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 40 }}>
            {results.map((cp, i) => (
              <CheckpointRow key={cp.id} name={cp.name} description={cp.description} status={cp.status} index={i} isLast={i === results.length - 1 || i === results.length - 2} />
            ))}
          </div>
        )}

        {scanType === 'custom' && (
          <>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Activity size={16} color="#3b82f6" />
              <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                SELECT CHECKS TO RUN · {selectedChecks.length}/{customCPs.length} SELECTED
              </span>
              {selectedChecks.length > 0 && (
                <button onClick={() => setSelectedChecks([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 11, color: '#475569', cursor: 'pointer', fontFamily: 'monospace' }}>
                  CLEAR ALL
                </button>
              )}
              <button onClick={() => setSelectedChecks(customCPs.map(c => c.id))} style={{ background: 'none', border: 'none', fontSize: 11, color: '#3b82f6', cursor: 'pointer', fontFamily: 'monospace', marginLeft: selectedChecks.length > 0 ? 0 : 'auto' }}>
                SELECT ALL
              </button>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 40 }}>
              {customCPs.map((cp, i) => {
                const sel = selectedChecks.includes(cp.id);
                return (
                  <motion.label key={cp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="check-label" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 10, cursor: 'pointer', background: sel ? 'rgba(59,130,246,.06)' : 'rgba(15,23,42,.5)', border: `0.5px solid ${sel ? 'rgba(59,130,246,.35)' : 'rgba(148,163,184,.1)'}`, transition: 'all .15s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: sel ? 'rgba(59,130,246,.25)' : 'rgba(15,23,42,.8)', border: `0.5px solid ${sel ? 'rgba(59,130,246,.7)' : 'rgba(148,163,184,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                      {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <input type="checkbox" checked={sel} onChange={() => toggleCheck(cp.id)} style={{ display: 'none' }} />
                    <span style={{ fontSize: 11, color: sel ? '#3b82f6' : '#334155', fontFamily: 'monospace', flexShrink: 0, transition: 'color .15s' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: sel ? '#93c5fd' : '#cbd5e1', margin: '0 0 2px', transition: 'color .15s' }}>{cp.name}</p>
                      <p style={{ fontSize: 11, color: '#475569', margin: 0, fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cp.description}</p>
                    </div>
                  </motion.label>
                );
              })}
            </div>

            {/* ✅ Custom scan: show animated timeline after checks are selected and running */}
            {checkpoints.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 40 }}>
                {results.map((cp, i) => (
                  <CheckpointRow key={cp.id} name={cp.name} description={cp.description} status={cp.status} index={i} isLast={i === results.length - 1 || i === results.length - 2} />
                ))}
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {isDone && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {scanType !== 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '10px 24px', borderRadius: 8, marginBottom: 4, background: 'rgba(15,23,42,.6)', border: '0.5px solid rgba(148,163,184,.1)' }}>
                  <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>SUMMARY</span>
                  <span style={{ fontSize: 12, color: '#34d399', fontFamily: 'monospace' }}>{passed} passed</span>
                  <span style={{ width: 1, height: 12, background: 'rgba(148,163,184,.15)' }} />
                  <span style={{ fontSize: 12, color: '#f87171', fontFamily: 'monospace' }}>{failed} failed</span>
                  <span style={{ width: 1, height: 12, background: 'rgba(148,163,184,.15)' }} />
                  <span style={{ fontSize: 12, color: scoreColor, fontFamily: 'monospace' }}>Score {score}/10</span>
                </div>
              )}
              <button className="proceed-btn" onClick={() => navigate('/final-verdict')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 36px', borderRadius: 10, background: 'rgba(59,130,246,.15)', border: '0.5px solid rgba(59,130,246,.4)', color: '#60a5fa', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all .2s' }}>
                <Shield size={16} />
                View Final Report
                <ArrowRight size={16} />
              </button>
              <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.05em' }}>ANALYSIS COMPLETE · RESULTS READY</span>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
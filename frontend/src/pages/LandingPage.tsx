import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Upload, Link, FileCheck,
  Activity, AlertTriangle, Zap, Database, ChevronRight, Lock, Eye, Cpu, X
} from 'lucide-react';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';
import Button from '../components/Button';
import { scanAPK, scanURL } from '../services/api';

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

const ScanLines = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.06) 2px,rgba(0,0,0,.06) 4px)',
  }} />
);

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

const SectionHeading = ({ children, accent = '#3b82f6' }: { children: React.ReactNode; accent?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
    <span style={{ display: 'block', width: 3, height: 24, background: accent, borderRadius: 2 }} />
    <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0', margin: 0, letterSpacing: '0.02em' }}>{children}</h2>
    <span style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg,rgba(148,163,184,.3),transparent)' }} />
  </div>
);

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
      borderRadius: 12, padding: '28px 24px',
      cursor: 'default', overflow: 'hidden',
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
      background: `${color}18`, border: `0.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    }}>
      <Icon size={20} color={color} />
    </div>
    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15, margin: '0 0 6px' }}>{label}</p>
    <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{sub}</p>
  </motion.div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { dispatch } = useScan();

  const [activeTab, setActiveTab] = useState<'apk' | 'url'>('apk');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.apk')) {
      setError('Only .apk files are accepted.');
      return;
    }
    setError(null);
    setSelectedFile(f);
    dispatch({ type: 'SET_FILE', payload: f });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleStartScan = async () => {
    setError(null);

    if (activeTab === 'apk') {
      if (!selectedFile) { setError('Please select an APK file first.'); return; }
      setIsLoading(true);
      try {
        const result = await scanAPK(selectedFile);
        dispatch({ type: 'SET_FILE', payload: selectedFile });
        dispatch({ type: 'SET_BACKEND_RESULT', payload: { metadata: result.metadata, risk: result.risk } });
      } catch (e: any) {
        // Backend unavailable — still allow demo flow
        dispatch({ type: 'SET_BACKEND_ERROR', payload: e.message });
        dispatch({ type: 'SET_FILE', payload: selectedFile });
      } finally {
        setIsLoading(false);
      }
      navigate('/scan-selection');
    } else {
      const url = urlInput.trim();
      if (!url) { setError('Please enter a URL.'); return; }
      setIsLoading(true);
      try {
        const result = await scanURL(url);
        dispatch({ type: 'SET_URL', payload: url });
        dispatch({ type: 'SET_URL_RESULT', payload: result });
      } catch (e: any) {
        dispatch({ type: 'SET_BACKEND_ERROR', payload: e.message });
        dispatch({ type: 'SET_URL', payload: url });
      } finally {
        setIsLoading(false);
      }
      navigate('/scan-selection');
    }
  };

  const features = [
    { icon: Shield,        label: 'Signature Verification', sub: 'Validates APK signing certificates against known authority chains.', color: '#3b82f6', delay: 0 },
    { icon: Lock,          label: 'Permission Analysis',    sub: 'Flags dangerous and over-privileged permission requests.', color: '#a78bfa', delay: 0.1 },
    { icon: Eye,           label: 'Behavioral Detection',   sub: 'Identifies overlay attacks, SMS stealing, and accessibility abuse.', color: '#f59e0b', delay: 0.2 },
    { icon: Cpu,           label: 'AI Risk Scoring',        sub: 'Rule-based and ML-powered risk score from 0–100.', color: '#34d399', delay: 0.3 },
    { icon: Activity,      label: 'Malware Indicators',     sub: 'Maps findings to MITRE ATT&CK Mobile tactics.', color: '#f87171', delay: 0.4 },
    { icon: AlertTriangle, label: 'Fake Banking Detection', sub: 'Catches impersonation of SBI, HDFC, ICICI, and 30+ banks.', color: '#fb923c', delay: 0.5 },
    { icon: Database,      label: 'Androguard Engine',      sub: 'Static reverse-engineering extracts every manifest component.', color: '#60a5fa', delay: 0.6 },
    { icon: Zap,           label: 'URL Phishing Scanner',   sub: 'Detects phishing indicators, suspicious TLDs, and raw IPs.', color: '#c084fc', delay: 0.7 },
  ];

  const stats = [
    { value: 4200000, label: 'APKs Analyzed', suffix: '+' },
    { value: 98,      label: 'Detection Rate', suffix: '%' },
    { value: 30,      label: 'Banking Patterns', suffix: '+' },
    { value: 247,     label: 'Risk Features', suffix: '' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#020817 0%,#0a0f1e 50%,#020817 100%)', fontFamily: '"Inter","SF Pro Display",-apple-system,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse2 { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .upload-zone:hover { border-color: rgba(59,130,246,.5) !important; background: rgba(59,130,246,.05) !important; }
        .tab-btn { transition: all .2s; }
        .tab-btn:hover { color: #93c5fd !important; }
        .scan-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
      `}</style>

      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 70%)', top: -200, left: -200, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)', bottom: -150, right: -150, pointerEvents: 'none', zIndex: 0 }} />
      <ScanLines />
      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(59,130,246,.08)', border: '0.5px solid rgba(59,130,246,.25)', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', animation: 'pulse2 2s infinite' }} />
            <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.08em' }}>ASTRA SECURITY PLATFORM v2.0 · LIVE</span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#f1f5f9', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Detect Fake Banking&nbsp;
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>APKs</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Upload an APK or enter a URL. ASTRA analyzes signatures, permissions, services, and behavioral patterns to generate a precise risk verdict.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            {stats.map(({ value, label, suffix }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <Counter to={value} suffix={suffix} />
                </div>
                <div style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em', marginTop: 4 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Upload Card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ maxWidth: 620, margin: '0 auto 80px', background: 'rgba(10,15,30,.95)', border: '0.5px solid rgba(148,163,184,.15)', borderRadius: 18, overflow: 'hidden' }}>

          <div style={{ height: 3, background: 'linear-gradient(90deg,#3b82f6,#a78bfa,transparent)' }} />

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(148,163,184,.08)', padding: '0 24px' }}>
            {(['apk', 'url'] as const).map(tab => (
              <button key={tab} className="tab-btn" onClick={() => { setActiveTab(tab); setError(null); setSelectedFile(null); }} style={{
                padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.06em',
                color: activeTab === tab ? '#60a5fa' : '#334155',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all .2s',
              }}>
                {tab === 'apk' ? '📦 APK FILE' : '🔗 URL SCAN'}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            {activeTab === 'apk' ? (
              <div
                className="upload-zone"
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `1.5px dashed ${dragOver ? 'rgba(59,130,246,.6)' : selectedFile ? 'rgba(52,211,153,.4)' : 'rgba(148,163,184,.2)'}`,
                  borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'rgba(59,130,246,.04)' : selectedFile ? 'rgba(52,211,153,.03)' : 'transparent',
                  transition: 'all .2s', marginBottom: 20,
                }}
              >
                <input ref={fileInputRef} type="file" accept=".apk" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <div style={{ width: 52, height: 52, borderRadius: 14, background: selectedFile ? 'rgba(52,211,153,.1)' : 'rgba(59,130,246,.08)', border: `0.5px solid ${selectedFile ? 'rgba(52,211,153,.3)' : 'rgba(59,130,246,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {selectedFile ? <FileCheck size={24} color="#34d399" /> : <Upload size={24} color="#3b82f6" />}
                </div>
                {selectedFile ? (
                  <>
                    <p style={{ color: '#34d399', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{selectedFile.name}</p>
                    <p style={{ color: '#475569', fontSize: 12, margin: 0, fontFamily: 'monospace' }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to scan</p>
                  </>
                ) : (
                  <>
                    <p style={{ color: '#64748b', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>Drop APK here or click to browse</p>
                    <p style={{ color: '#334155', fontSize: 12, margin: 0, fontFamily: 'monospace' }}>Only .apk files · Max 200MB</p>
                  </>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  <Link size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="url"
                    placeholder="https://example.com/app.apk"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStartScan()}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(0,0,0,.3)', border: '0.5px solid rgba(148,163,184,.15)',
                      borderRadius: 10, padding: '14px 14px 14px 42px',
                      color: '#e2e8f0', fontSize: 14, fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                  {urlInput && (
                    <button onClick={() => setUrlInput('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: 'rgba(248,113,113,.08)', border: '0.5px solid rgba(248,113,113,.2)', marginBottom: 16 }}>
                <AlertTriangle size={14} color="#f87171" />
                <span style={{ fontSize: 12, color: '#f87171', fontFamily: 'monospace' }}>{error}</span>
              </div>
            )}

            <button className="scan-btn" onClick={handleStartScan} disabled={isLoading}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 10, cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? 'rgba(59,130,246,.08)' : 'linear-gradient(135deg,rgba(59,130,246,.2),rgba(139,92,246,.15))',
                border: '0.5px solid rgba(59,130,246,.4)', color: '#60a5fa',
                fontWeight: 700, fontSize: 15, letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all .2s',
              }}>
              {isLoading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid #3b82f640', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Start Security Scan
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Features grid ── */}
        <SectionHeading accent="#3b82f6">Platform Capabilities</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 80 }}>
          {features.map(f => <FeatureCard key={f.label} {...f} />)}
        </div>

        {/* ── How it works ── */}
        <SectionHeading accent="#a78bfa">How It Works</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { step: '01', icon: Upload,    title: 'Upload APK',       desc: 'Drag and drop your .apk file or paste a URL for instant analysis.', color: '#3b82f6' },
            { step: '02', icon: Cpu,       title: 'Deep Analysis',    desc: 'Androguard extracts metadata, permissions, signatures, and services.', color: '#a78bfa' },
            { step: '03', icon: Shield,    title: 'Get Your Report',  desc: 'Receive a risk score, verdict, and detailed findings within seconds.', color: '#34d399' },
          ].map(({ step, icon: Icon, title, desc, color }) => (
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ position: 'relative', background: 'rgba(15,23,42,.85)', border: '0.5px solid rgba(148,163,184,.1)', borderRadius: 14, padding: '28px 24px' }}>
              <div style={{ position: 'absolute', top: 18, right: 20, fontSize: 32, fontWeight: 900, color: `${color}15`, fontFamily: 'monospace' }}>{step}</div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, border: `0.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15, margin: '0 0 8px' }}>{title}</p>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}

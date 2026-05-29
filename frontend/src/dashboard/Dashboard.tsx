import { Upload, Link, FileBarChart2, Clock, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import StatCard from "./StatCard";
import { currentUser, statsData, scanHistory, systemStatus } from "../data/dummyData";

const riskConfig = {
  low: {
    label: "Low",
    className: "bg-[#00FFA315] text-[#00FFA3] border border-[#00FFA320]",
    dot: "bg-[#00FFA3]",
  },
  medium: {
    label: "Medium",
    className: "bg-[#FFB80015] text-[#FFB800] border border-[#FFB80020]",
    dot: "bg-[#FFB800]",
  },
  high: {
    label: "High",
    className: "bg-[#FF336615] text-[#FF3366] border border-[#FF336620]",
    dot: "bg-[#FF3366] animate-pulse",
  },
};

const statusConfig = {
  completed: { label: "Completed", icon: <CheckCircle2 size={12} />, className: "text-[#00FFA3]" },
  in_progress: { label: "Scanning...", icon: <Loader2 size={12} className="animate-spin" />, className: "text-[#00E5FF]" },
};

export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-full">

      {/* Welcome Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8 fade-up-1"
        style={{
          background: "linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(0,229,255,0.08) 50%, rgba(124,58,237,0.1) 100%)",
          border: "1px solid rgba(0,229,255,0.15)",
          boxShadow: "0 0 40px rgba(0,102,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#0066FF15] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#00E5FF10] blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-[11px] text-[#00FFA3] font-semibold uppercase tracking-widest">
                System Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {greeting},{" "}
              <span
                className="text-glow-cyan"
                style={{
                  background: "linear-gradient(90deg, #00E5FF, #0066FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {currentUser.name.split(" ")[0]}
              </span>
              <span className="ml-2 animate-glow-pulse">👋</span>
            </h1>
            <p className="text-sm text-[#4A6080] max-w-lg leading-relaxed">
              A.S.T.R.A is actively monitoring your environment. Threat database is current.
              Your last scan completed with no critical vulnerabilities.
            </p>
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
            <div className="flex items-center gap-2 bg-[#0A1628] border border-[#1A2F4E] rounded-xl px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-xs text-[#C8D8F0] font-medium">Engine Online</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0A1628] border border-[#1A2F4E] rounded-xl px-3 py-2">
              <Clock size={11} className="text-[#4A6080]" />
              <span className="text-xs text-[#4A6080]">DB: {systemStatus.dbVersion}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0A1628] border border-[#1A2F4E] rounded-xl px-3 py-2">
              <span className="text-xs text-[#4A6080]">Uptime:</span>
              <span className="text-xs text-[#00FFA3] font-mono font-semibold">{systemStatus.uptime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <StatCard key={stat.id} {...stat} trend={stat.trend as "up" | "down"} color={stat.color as "cyan" | "red" | "green" | "amber"} delay={i} />
        ))}
      </div>

      {/* Middle Row: Scan History + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 fade-up-5">

        {/* Scan History Table */}
        <div
          className="xl:col-span-2 glass rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A2F4E]">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Recent Scan Activity</h2>
              <p className="text-[11px] text-[#4A6080] mt-0.5">{scanHistory.length} scans in the last 3 days</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-[#00E5FF] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#00E5FF10]">
              View all <ExternalLink size={11} />
            </button>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#4A6080] border-b border-[#1A2F4E40]">
            <div className="col-span-5">Application</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Risk</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-[#1A2F4E30]">
            {scanHistory.map((scan, idx) => {
              const risk = riskConfig[scan.riskLevel as keyof typeof riskConfig];
              const status = statusConfig[scan.status as keyof typeof statusConfig];
              return (
                <div
                  key={scan.id}
                  className="grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-[#0A1628] transition-colors group cursor-pointer items-center"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0A1628] border border-[#1A2F4E] flex items-center justify-center text-[10px] font-bold text-[#4A6080] font-mono group-hover:border-[#00E5FF30] transition-colors flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate group-hover:text-[#00E5FF] transition-colors">
                        {scan.appName}
                      </div>
                      <div className="text-[10px] text-[#4A6080] flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A6080] inline-block" />
                        {scan.platform}
                        {scan.threats > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-[#FF336699]">{scan.threats} threats</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block col-span-3">
                    <div className="text-xs text-[#C8D8F0]">{scan.date}</div>
                    <div className="text-[10px] text-[#4A6080]">{scan.time}</div>
                  </div>
                  <div className="hidden sm:block col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg ${risk.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                      {risk.label}
                    </span>
                  </div>
                  <div className={`hidden sm:flex col-span-2 items-center gap-1.5 text-[11px] font-medium ${status.className}`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-4" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Quick Actions</h2>
            <p className="text-[11px] text-[#4A6080] mt-0.5">Launch security operations</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 flex-1">
            <button
              className="w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,102,255,0.05))",
                border: "1px solid rgba(0,229,255,0.12)",
                boxShadow: "0 0 0 0 rgba(0,229,255,0)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,229,255,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 0 rgba(0,229,255,0)";
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF20] to-[#0066FF20] border border-[#00E5FF25] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Upload size={16} className="text-[#00E5FF]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors">Upload APK</div>
                <div className="text-[11px] text-[#4A6080]">Scan Android package file</div>
              </div>
            </button>

            <button
              className="w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, rgba(0,255,163,0.06), rgba(0,229,255,0.04))",
                border: "1px solid rgba(0,255,163,0.1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,255,163,0.12)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#00FFA310] border border-[#00FFA320] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Link size={16} className="text-[#00FFA3]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white group-hover:text-[#00FFA3] transition-colors">Scan via URL</div>
                <div className="text-[11px] text-[#4A6080]">Analyze from app store link</div>
              </div>
            </button>

            <button
              className="w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,102,255,0.05))",
                border: "1px solid rgba(124,58,237,0.12)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED12] border border-[#7C3AED20] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileBarChart2 size={16} className="text-[#A78BFA]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">View Reports</div>
                <div className="text-[11px] text-[#4A6080]">Browse full scan reports</div>
              </div>
            </button>
          </div>

          {/* Threat intel card */}
          <div
            className="mt-auto rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(255,51,102,0.06), rgba(255,107,107,0.04))",
              border: "1px solid rgba(255,51,102,0.12)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#FF3366] uppercase tracking-wider">Threat Intel</span>
            </div>
            <p className="text-[11px] text-[#4A6080] leading-relaxed">
              138 threats catalogued this month. 4 new CVEs added to the threat database today.
            </p>
            <button className="mt-2 text-[11px] text-[#FF3366] hover:text-white transition-colors font-medium">
              View threat feed →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

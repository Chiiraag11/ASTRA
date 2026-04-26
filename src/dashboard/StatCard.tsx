import { TrendingUp, TrendingDown, ScanLine, ShieldAlert, ShieldCheck, Activity } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
  color: "cyan" | "red" | "green" | "amber";
  sub: string;
  delay?: number;
}

const colorMap = {
  cyan: {
    icon: "text-[#00E5FF]",
    iconBg: "bg-[#00E5FF12] border-[#00E5FF20]",
    glow: "hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]",
    bar: "from-[#00E5FF] to-[#0066FF]",
    badge: "bg-[#00E5FF15] text-[#00E5FF] border-[#00E5FF20]",
    dot: "bg-[#00E5FF]",
  },
  red: {
    icon: "text-[#FF3366]",
    iconBg: "bg-[#FF336612] border-[#FF336620]",
    glow: "hover:shadow-[0_0_30px_rgba(255,51,102,0.12)]",
    bar: "from-[#FF3366] to-[#FF6B6B]",
    badge: "bg-[#FF336615] text-[#FF3366] border-[#FF336620]",
    dot: "bg-[#FF3366]",
  },
  green: {
    icon: "text-[#00FFA3]",
    iconBg: "bg-[#00FFA312] border-[#00FFA320]",
    glow: "hover:shadow-[0_0_30px_rgba(0,255,163,0.12)]",
    bar: "from-[#00FFA3] to-[#00E5FF]",
    badge: "bg-[#00FFA315] text-[#00FFA3] border-[#00FFA320]",
    dot: "bg-[#00FFA3]",
  },
  amber: {
    icon: "text-[#FFB800]",
    iconBg: "bg-[#FFB80012] border-[#FFB80020]",
    glow: "hover:shadow-[0_0_30px_rgba(255,184,0,0.12)]",
    bar: "from-[#FFB800] to-[#FF6B00]",
    badge: "bg-[#FFB80015] text-[#FFB800] border-[#FFB80020]",
    dot: "bg-[#FFB800]",
  },
};

const iconMap: Record<string, React.ReactNode> = {
  scan: <ScanLine size={18} />,
  "shield-alert": <ShieldAlert size={18} />,
  "shield-check": <ShieldCheck size={18} />,
  activity: <Activity size={18} />,
};

export default function StatCard({ label, value, change, trend, icon, color, sub, delay = 0 }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`
        relative group glass rounded-2xl p-5 overflow-hidden
        transition-all duration-300 cursor-default
        hover:-translate-y-1 ${c.glow}
        fade-up-${delay + 1}
      `}
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none">
        <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-bl ${c.bar} rounded-bl-full opacity-30`} />
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.iconBg} ${c.icon} flex-shrink-0`}>
          {iconMap[icon]}
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border ${c.badge}`}>
          {trend === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      </div>

      {/* Value */}
      <div className="mb-1">
        <span
          className="text-3xl font-black text-white leading-none"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {value}
        </span>
      </div>

      {/* Label */}
      <div className="text-sm font-semibold text-[#C8D8F0] mb-1">{label}</div>

      {/* Sub */}
      <div className="text-[11px] text-[#4A6080]">{sub}</div>

      {/* Bottom bar */}
      <div className="mt-4 h-0.5 rounded-full bg-[#1A2F4E] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all duration-1000 ease-out`}
          style={{ width: trend === "up" ? "72%" : "40%" }}
        />
      </div>
    </div>
  );
}

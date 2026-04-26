import { useState } from "react";
import {
  LayoutDashboard,
  ScanLine,
  FileBarChart2,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "scan-history", label: "Scan History", icon: <ScanLine size={18} /> },
  { id: "reports", label: "Reports", icon: <FileBarChart2 size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function Sidebar({ activeTab, onTabChange, mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col glass-strong
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ borderRight: "1px solid rgba(0,229,255,0.1)" }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF44] to-transparent" />

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 mb-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#0066FF] flex items-center justify-center shadow-glow-cyan">
              <Shield size={18} className="text-[#050D1A]" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00FFA3] rounded-full border-2 border-[#050D1A] animate-pulse" />
          </div>
          {!collapsed && (
            <div>
              <div
                className="font-display font-black text-lg tracking-widest text-white leading-none"
                style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
              >
                A.S.T.R.A
              </div>
              <div className="text-[10px] text-[#00E5FF99] font-mono tracking-wider mt-0.5">
                THREAT ANALYSIS
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[#1A2F4E] to-transparent mb-4" />

        {/* Nav Label */}
        {!collapsed && (
          <div className="px-5 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A6080] font-semibold">
              Navigation
            </span>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onMobileClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group relative overflow-hidden
                  ${collapsed ? "justify-center" : ""}
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[#00E5FF15] to-[#0066FF10] text-[#00E5FF]"
                      : "text-[#4A6080] hover:text-[#C8D8F0] hover:bg-[#0A1628]"
                  }
                `}
                style={
                  isActive
                    ? { boxShadow: "inset 0 0 0 1px rgba(0,229,255,0.2), 0 0 20px rgba(0,229,255,0.05)" }
                    : {}
                }
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00E5FF] rounded-r-full shadow-glow-cyan" />
                )}
                <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#00E5FF]" : ""}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        {!collapsed && (
          <div className="mx-3 mb-4 p-3 rounded-xl bg-gradient-to-br from-[#00E5FF08] to-[#0066FF08] border border-[#00E5FF15]">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-[#FFB800]" />
              <span className="text-[10px] font-semibold text-[#FFB800] uppercase tracking-wider">System Online</span>
            </div>
            <div className="text-[10px] text-[#4A6080]">
              Engine v24.04 · DB current
            </div>
            <div className="mt-2 h-1 rounded-full bg-[#1A2F4E] overflow-hidden">
              <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-[#00E5FF] to-[#0066FF]" />
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex mx-3 mb-4 items-center justify-center gap-2 py-2 rounded-xl text-[#4A6080] hover:text-[#00E5FF] hover:bg-[#0A1628] transition-all duration-200 border border-transparent hover:border-[#1A2F4E]"
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </aside>
    </>
  );
}

import { useState } from "react";
import { Bell, LogOut, Menu, Search, ChevronDown, X, Shield, AlertTriangle } from "lucide-react";
import { currentUser } from "../data/dummyData";

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

const notifications = [
  { id: 1, type: "threat", text: "High-risk APK detected in latest scan", time: "2m ago", read: false },
  { id: 2, type: "info", text: "Threat database updated to v24.04.2026", time: "1h ago", read: false },
  { id: 3, type: "safe", text: "CloudVault scan completed — 7 threats found", time: "3h ago", read: true },
];

export default function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="glass-strong sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 h-16"
      style={{ borderBottom: "1px solid rgba(0,229,255,0.08)" }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#4A6080] hover:text-[#00E5FF] hover:bg-[#0A1628] transition-all"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-[#0A1628] border border-[#1A2F4E] rounded-xl px-3 py-2 w-64 group focus-within:border-[#00E5FF44] transition-all">
          <Search size={14} className="text-[#4A6080] group-focus-within:text-[#00E5FF] transition-colors flex-shrink-0" />
          <input
            type="text"
            placeholder="Search scans, apps, threats..."
            className="bg-transparent text-sm text-[#C8D8F0] placeholder-[#4A6080] outline-none w-full"
          />
          <kbd className="hidden lg:flex items-center text-[10px] text-[#4A6080] border border-[#1A2F4E] rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-[#4A6080] hover:text-[#00E5FF] hover:bg-[#0A1628] transition-all border border-transparent hover:border-[#1A2F4E]"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3366] rounded-full border border-[#050D1A] animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-12 w-80 rounded-2xl glass-strong overflow-hidden z-50"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.1)" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A2F4E]">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <span className="text-[10px] bg-[#FF336615] text-[#FF3366] border border-[#FF336630] rounded-full px-2 py-0.5">
                      {unread} new
                    </span>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-[#4A6080] hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-[#1A2F4E]">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-[#0A1628] transition-colors ${!n.read ? "bg-[#00E5FF05]" : ""}`}>
                    <div className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${
                      n.type === "threat" ? "bg-[#FF336615]" : n.type === "safe" ? "bg-[#00FFA315]" : "bg-[#00E5FF15]"
                    }`}>
                      {n.type === "threat" ? (
                        <AlertTriangle size={13} className="text-[#FF3366]" />
                      ) : (
                        <Shield size={13} className={n.type === "safe" ? "text-[#00FFA3]" : "text-[#00E5FF]"} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#C8D8F0] leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-[#4A6080] mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[#1A2F4E]">
                <button className="text-xs text-[#00E5FF] hover:text-white transition-colors">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#1A2F4E] mx-1" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-[#0A1628] border border-transparent hover:border-[#1A2F4E] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#0066FF] flex items-center justify-center text-xs font-bold text-[#050D1A] flex-shrink-0">
              {currentUser.avatar}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-[#4A6080] mt-0.5">{currentUser.role}</div>
            </div>
            <ChevronDown size={13} className={`hidden md:block text-[#4A6080] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-14 w-56 rounded-2xl glass-strong overflow-hidden z-50"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.1)" }}
            >
              <div className="px-4 py-3 border-b border-[#1A2F4E]">
                <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                <div className="text-[11px] text-[#4A6080] mt-0.5">{currentUser.email}</div>
              </div>
              <div className="p-2">
                <div className="px-3 py-1.5 text-xs text-[#4A6080]">
                  Last login: <span className="text-[#C8D8F0]">{currentUser.lastLogin}</span>
                </div>
              </div>
              <div className="p-2 border-t border-[#1A2F4E]">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#FF3366] hover:bg-[#FF336610] transition-all text-sm">
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

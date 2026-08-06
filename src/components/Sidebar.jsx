import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScanLine, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Lock,
  ChevronRight,
  ChevronDown,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Guardrail Scanner', path: '/scanner', icon: ScanLine },
    { label: 'Security Policies', path: '/policies', icon: SlidersHorizontal },
    { label: 'Audit Logs & Compliance', path: '/audit-logs', icon: FileSpreadsheet },
    { label: 'Settings & API Keys', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none z-30 shrink-0">
      <div>
        {/* Brand & Organization Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
                TrustGuard <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Building2 className="w-3 h-3 text-slate-500" strokeWidth={1.5} /> CyberShield Inc.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3.5 space-y-1">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" strokeWidth={1.5} />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile Section */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950 relative">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.email || 'admin@trustguard.ai'}</p>
              <p className="text-[10px] text-emerald-400 font-medium tracking-wide flex items-center gap-1 uppercase">
                <Lock className="w-2.5 h-2.5" strokeWidth={1.5} /> {user?.role || 'admin'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out of TrustGuard"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

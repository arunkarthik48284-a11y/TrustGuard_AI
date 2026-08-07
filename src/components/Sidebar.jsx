import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScanLine, 
  Globe,
  Bot,
  Database,
  SlidersHorizontal, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Lock,
  ChevronRight,
  Building2,
  Radio,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen = false, setMobileOpen = () => {} }) => {
  const { user, logout, isDemoMode } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Guardrail Scanner', path: '/scanner', icon: ScanLine },
    { label: 'Agentic Tool Interceptor', path: '/agentic-intercept', icon: Bot },
    { label: 'URL Security Scanner', path: '/url-scanner', icon: Globe },
    { label: 'Breach Intelligence', path: '/breach-intel', icon: Database },
    { label: 'Security Policies', path: '/policies', icon: SlidersHorizontal },
    { label: 'Audit Logs & Compliance', path: '/audit-logs', icon: FileSpreadsheet },
    { label: 'Settings & API Keys', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 select-none transition-colors duration-200">
      <div>
        {/* Brand & Organization Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                TrustGuard <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">AI</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" strokeWidth={1.5} /> CyberShield Inc.
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Persistent Demo / Live Status Banner Box */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/60">
          {isDemoMode ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" strokeWidth={2} />
              <div className="truncate">
                <span className="block font-bold">Demo Mode Active</span>
                <span className="text-[10px] opacity-80 block">Using sample guardrail rules</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <div className="truncate">
                <span className="block font-bold">Live API Active</span>
                <span className="text-[10px] opacity-80 block">Real-time guardrail engine</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="p-3.5 space-y-1.5">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-150 min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" strokeWidth={1.5} />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block truncate">{user?.name || 'Security Admin'}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-mono">{user?.email || 'admin@trustguard.ai'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 font-mono">
          <span>Engine v2.4.0</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Security Active
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-72 h-full bg-white dark:bg-slate-950">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)}></div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

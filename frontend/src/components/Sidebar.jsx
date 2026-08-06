import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  ScanLine, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  Settings, 
  LogOut, 
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Guardrail Scanner', path: '/scanner', icon: ScanLine },
    { label: 'Security Policies', path: '/policies', icon: SlidersHorizontal },
    { label: 'Audit Logs & Compliance', path: '/audit-logs', icon: FileSpreadsheet },
    { label: 'Settings & API Keys', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A]/90 border-r border-gray-800 flex flex-col justify-between min-h-screen select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1.5">
              TrustGuard <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">Enterprise Security & Trust</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-gray-800 bg-[#0B0F19]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-200 truncate">{user?.email || 'admin@trustguard.ai'}</p>
              <p className="text-[10px] text-cyan-400 uppercase font-medium tracking-wide flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> {user?.role || 'admin'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

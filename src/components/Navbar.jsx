import React from 'react';
import { 
  Menu,
  Search, 
  Bell, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title = 'Security Command Center', onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-slate-950/85 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 min-h-[40px] flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">{title}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Guardrails Active</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Quick Search Input */}
        <div className="relative hidden md:block w-56 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search threats, logs, rules..."
            className="w-full bg-slate-900/80 text-slate-200 text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        {/* Notifications & Help */}
        <div className="flex items-center gap-1.5">
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-800 min-h-[38px] flex items-center justify-center">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-800 min-h-[38px] flex items-center justify-center">
            <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

        {/* Gemini Engine Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
          <span className="font-semibold text-[11px] text-slate-200">Gemini 2.5 Flash</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

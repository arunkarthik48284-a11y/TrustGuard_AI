import React from 'react';
import { 
  Menu,
  Search, 
  Bell, 
  HelpCircle, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ title = 'Security Command Center', onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-emerald-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 min-h-[40px] flex items-center justify-center transition-all"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">{title}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
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
            className="w-full bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        {/* Theme Toggle Button (Sun/Moon) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-indigo-600 dark:text-amber-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 min-h-[38px] flex items-center justify-center gap-1.5 transition-all font-semibold text-xs px-3"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" strokeWidth={1.5} />
              <span className="hidden lg:inline text-[11px] text-slate-300">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/20" strokeWidth={1.5} />
              <span className="hidden lg:inline text-[11px] text-slate-700">Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications & Help */}
        <div className="flex items-center gap-1.5">
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 min-h-[38px] flex items-center justify-center">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800 min-h-[38px] flex items-center justify-center">
            <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        {/* Gemini Engine Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" strokeWidth={1.5} />
          <span className="font-semibold text-[11px]">Gemini 2.5 Flash</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

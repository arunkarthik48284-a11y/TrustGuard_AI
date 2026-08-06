import React from 'react';
import { Bell, ShieldCheck, Zap, Sparkles, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title = "Dashboard Overview" }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-gray-800 bg-[#0B0F19]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Firewall Live
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Launch Scan Button */}
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Scan</span>
        </button>

        {/* Organization Tag */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-gray-300 text-xs font-medium">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{user?.organization_name || 'CyberShield Enterprise'}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/80 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B0F19]"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

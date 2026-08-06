import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive = true, icon: Icon, color = 'emerald', subtitle }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-400'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badge: 'bg-amber-500/15 text-amber-400'
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      badge: 'bg-rose-500/15 text-rose-400'
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-400'
    }
  };

  const activeColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`p-2.5 rounded-xl border ${activeColor.bg}`}>
          {Icon && <Icon className="w-5 h-5" strokeWidth={1.5} />}
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</h3>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
        {change !== undefined && (
          <div className={`flex items-center gap-1.5 font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} /> : <TrendingDown className="w-3.5 h-3.5" strokeWidth={1.5} />}
            <span>{change}</span>
          </div>
        )}
        {subtitle && <span className="text-slate-400 text-[11px] font-medium">{subtitle}</span>}
      </div>
    </div>
  );
};

export default MetricCard;

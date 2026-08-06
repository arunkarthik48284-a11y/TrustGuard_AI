import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive = true, icon: Icon, color = 'cyan', subtitle }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
    rose: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    violet: 'from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/30',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30'
  };

  const selectedColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedColor} border`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change !== undefined && (
          <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
        {subtitle && <span className="text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
};

export default MetricCard;

import React from 'react';

const RiskGauge = ({ score = 0, size = 140, strokeWidth = 10, showLabel = true }) => {
  const normalizedScore = Math.min(100, Math.max(0, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine color based on risk score
  const getColor = (s) => {
    if (s >= 75) return { stroke: '#f43f5e', text: 'text-rose-500', bg: 'bg-rose-500/10', label: 'CRITICAL' };
    if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500/10', label: 'HIGH' };
    if (s >= 25) return { stroke: '#06b6d4', text: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'MEDIUM' };
    return { stroke: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'LOW' };
  };

  const colorInfo = getColor(normalizedScore);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
          fill="transparent"
        />
        {/* Animated Risk Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorInfo.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-black tracking-tight ${colorInfo.text}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
            Risk Score
          </span>
        </div>
      )}
    </div>
  );
};

export default RiskGauge;

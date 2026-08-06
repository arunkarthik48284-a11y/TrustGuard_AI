import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock } from 'lucide-react';

const StatusBadge = ({ level = 'low', isBlocked = false }) => {
  if (isBlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs">
        <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
        <span>BLOCKED</span>
      </span>
    );
  }

  const normalizedLevel = String(level).toLowerCase();

  switch (normalizedLevel) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
          <span>CRITICAL RISK</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
          <span>HIGH RISK</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
          <span>MEDIUM RISK</span>
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
          <span>SAFE / PASSED</span>
        </span>
      );
  }
};

export default StatusBadge;

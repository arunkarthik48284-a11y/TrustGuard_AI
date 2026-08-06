import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldX, Info } from 'lucide-react';

const StatusBadge = ({ level = 'low', isBlocked = false }) => {
  const normalizedLevel = String(level).toLowerCase();

  if (isBlocked) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40">
        <ShieldX className="w-3.5 h-3.5" />
        BLOCKED
      </span>
    );
  }

  const styles = {
    critical: {
      bg: 'bg-rose-950/70 text-rose-400 border-rose-500/40',
      icon: AlertTriangle
    },
    high: {
      bg: 'bg-amber-950/70 text-amber-400 border-amber-500/40',
      icon: AlertTriangle
    },
    medium: {
      bg: 'bg-yellow-950/60 text-yellow-300 border-yellow-500/30',
      icon: Info
    },
    low: {
      bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2
    }
  };

  const current = styles[normalizedLevel] || styles.low;
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${current.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {normalizedLevel.toUpperCase()}
    </span>
  );
};

export default StatusBadge;

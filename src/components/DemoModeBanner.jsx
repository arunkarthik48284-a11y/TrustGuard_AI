import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoModeBanner = ({ isDemo = true }) => {
  if (!isDemo) {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
          <span><strong className="font-extrabold">Live Protection Active</strong> — Connected to TrustGuard AI Security Engine API</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-300 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={1.5} />
          <span>
            <strong className="font-extrabold text-amber-900 dark:text-amber-200">Interactive Demo Mode</strong> — Operating on simulated security telemetry.
          </span>
        </div>
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-200 hover:underline text-[11px] shrink-0"
        >
          Configure Live API Key <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default DemoModeBanner;

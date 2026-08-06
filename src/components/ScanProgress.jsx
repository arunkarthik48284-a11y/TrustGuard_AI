import React from 'react';
import { ShieldCheck, Sparkles, Lock, FileText, CheckCircle2 } from 'lucide-react';

const ScanProgress = ({ progress = 0, stageText = 'Analyzing Security Vectors...' }) => {
  const stages = [
    { threshold: 25, label: 'Initializing TrustGuard Engine', icon: ShieldCheck },
    { threshold: 50, label: 'Inspecting Threat Vectors with Gemini AI', icon: Sparkles },
    { threshold: 75, label: 'Redacting PII & Credentials', icon: Lock },
    { threshold: 100, label: 'Generating Cryptographic Audit Record', icon: FileText }
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-7 h-7 animate-spin" strokeWidth={1.5} />
        </div>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stageText}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">Inspecting payload structure, prompt injections, and PII leakage</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Inspection Progress</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pipeline Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {stages.map((st, i) => {
          const isDone = progress >= st.threshold;
          const Icon = st.icon;
          return (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-xs font-semibold ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
              ) : (
                <Icon className="w-4 h-4 opacity-50 shrink-0" strokeWidth={1.5} />
              )}
              <span className="truncate">{st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScanProgress;

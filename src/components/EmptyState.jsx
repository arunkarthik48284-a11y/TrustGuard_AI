import React from 'react';
import { ShieldAlert, Sparkles, FolderSearch } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No Data Records Found',
  description = 'No active security audit logs match your selected filter criteria.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 my-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.5} /> {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

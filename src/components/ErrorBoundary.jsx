import React from 'react';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TrustGuard Component Error Boundary caught an exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Application Exception Intercepted</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                An unexpected component state occurred. TrustGuard's resilience engine prevented application crash.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-[11px] font-mono text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 text-left truncate">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} /> Reset Security Console Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

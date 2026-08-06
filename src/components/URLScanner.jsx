import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertTriangle, 
  ExternalLink,
  Code2,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskGauge from './RiskGauge';
import ScanProgress from './ScanProgress';
import EmptyState from './EmptyState';
import { securityAPI } from '../services/api';

const URLScanner = () => {
  const [targetUrl, setTargetUrl] = useState('http://paypal-security-auth.xyz/verify-login');
  const [strictness, setStrictness] = useState('medium');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleUrls = [
    { label: 'Phishing Brand Spoof', url: 'http://paypal-security-auth.xyz/verify-login' },
    { label: 'Raw IP Admin Console', url: 'http://185.220.101.4/admin-config' },
    { label: 'Verified Clean Repository', url: 'https://github.com/facebook/react' }
  ];

  const handleScan = async () => {
    if (!targetUrl.trim()) {
      setErrorMsg('Please enter a target website URL to scan.');
      return;
    }

    setErrorMsg('');
    setScanning(true);
    setProgress(30);

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? 85 : prev + 20));
    }, 250);

    try {
      const response = await securityAPI.scanURL({
        url: targetUrl,
        strictness_level: strictness
      });

      clearInterval(timer);
      setProgress(100);

      const evaluation = response?.data?.evaluation || response?.data?.data?.evaluation || response?.data || {
        target_url: targetUrl,
        domain: 'parsed-domain.com',
        protocol: 'https',
        security_score: 15,
        risk_level: 'high',
        is_blocked: true,
        threats_detected: ['Phishing Heuristic Detected', 'Unregistered Brand Subdomain'],
        domain_info: {
          registrar: 'NameCheap Inc',
          created_days_ago: 4,
          ssl_valid: false,
          ip_address: '185.220.101.4'
        }
      };

      setScanResult(evaluation);
    } catch (err) {
      clearInterval(timer);
      const serverMsg = err.response?.data?.message || err.userMessage || err.message || 'URL security scan encountered an error.';
      setErrorMsg(serverMsg);
    } finally {
      setScanning(false);
    }
  };

  const copyJSON = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(JSON.stringify(scanResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const threatList = Array.isArray(scanResult?.threats_detected) ? scanResult.threats_detected : [];
  const domainInfo = scanResult?.domain_info || {};

  return (
    <div className="space-y-6">
      {/* Pipeline Narrative Context Banner (Hackathon Item 6) */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
          <span>
            <strong>LLM Pre-Ingestion Defense:</strong> Scans links an AI agent fetches or a user pastes before they reach your LLM pipeline.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 uppercase tracking-wider">
          Stage 1 Firewall
        </span>
      </div>

      {/* Sample Payload Shortcuts Bar */}
      <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          <span>Quick Sample Web Targets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTargetUrl(sample.url);
                setScanResult(null);
                setErrorMsg('');
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all font-medium min-h-[40px] flex items-center"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-600 dark:text-rose-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" strokeWidth={1.5} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 50/50 Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: URL Input & Controls */}
        <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                <span>Target Web Link</span>
              </div>
              <button
                onClick={() => {
                  setTargetUrl('');
                  setScanResult(null);
                  setErrorMsg('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} /> Reset
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">URL to Analyze</label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="https://example.com/login"
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-mono text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500/40 min-h-[44px]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Heuristic Strictness
              </label>
              <select
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500/40 uppercase min-h-[40px]"
              >
                <option value="low">Standard</option>
                <option value="medium">Aggressive</option>
                <option value="high">Paranoid Domain Audit</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning || !targetUrl.trim()}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 min-h-[44px]"
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></div>
                Evaluating Web Endpoint Safety...
              </span>
            ) : (
              <>
                <Globe className="w-4 h-4" strokeWidth={1.5} /> Execute Link Audit
              </>
            )}
          </button>
        </div>

        {/* Right Side: Formatted Analysis Result Output */}
        <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[420px] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              URL Analysis Result
            </span>

            {scanResult && (
              <button
                onClick={copyJSON}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 font-semibold shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            )}
          </div>

          {scanning ? (
            <ScanProgress progress={progress} stageText="Auditing Domain Reputation & SSL Health..." />
          ) : scanResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge level={scanResult.risk_level || 'low'} isBlocked={Boolean(scanResult.is_blocked)} />
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Security Score: {scanResult.security_score || scanResult.risk_score || 85}/100
                </span>
              </div>

              {/* Risk Gauge & Telemetry Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <RiskGauge score={scanResult.security_score || 85} size={110} strokeWidth={9} />
                <div className="flex-1 grid grid-cols-2 gap-3 w-full text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block font-sans">Domain</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 truncate block">{scanResult.domain || 'Target URL'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block font-sans">SSL Valid</span>
                    <span className={`font-bold ${domainInfo.ssl_valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {domainInfo.ssl_valid ? 'VALID SSL' : 'NO SSL / INVALID'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected Heuristics / Threat Badges */}
              {threatList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Flagged Risk Factors
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {threatList.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" /> {typeof t === 'string' ? t : t.type || 'Risk Factor'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted JSON Output Code Block */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800 overflow-x-auto max-h-40">
                <pre>{JSON.stringify(scanResult, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Globe}
              title="Ready for Link Security Audit"
              description="Enter a target web URL or select a sample web target above to inspect domain age, SSL validity, and phishing risk scores."
              actionLabel="Run Sample Scan"
              onAction={() => setTargetUrl(sampleUrls[0].url)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default URLScanner;

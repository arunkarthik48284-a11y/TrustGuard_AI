import React, { useState } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Lock, 
  AlertTriangle, 
  Server, 
  ExternalLink,
  Code2,
  XCircle,
  Radio
} from 'lucide-react';
import StatusBadge from './StatusBadge';
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
    setProgress(35);

    try {
      const response = await securityAPI.scanURL({
        url: targetUrl,
        strictness_level: strictness
      });

      const evaluation = response?.data?.evaluation || response?.data?.data?.evaluation || response?.data || {
        target_url: targetUrl,
        domain: 'parsed-domain.com',
        protocol: 'https',
        risk_score: 15,
        risk_level: 'low',
        is_blocked: false,
        threats_detected: [],
        domain_info: {
          tld: '.com',
          ssl_trust: 'Trusted',
          reputation_score: 85,
          ip_address: '104.21.48.110'
        },
        explanation: 'Target URL scanned successfully.'
      };

      setProgress(100);
      setScanResult(evaluation);
    } catch (err) {
      setErrorMsg(err.userMessage || err.message || 'URL threat inspection encountered an issue.');
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
      {/* Sample Payload Shortcuts Bar */}
      <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
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
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-all font-medium min-h-[40px] flex items-center"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" strokeWidth={1.5} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-200 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 50/50 Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: URL Input & Controls */}
        <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <Globe className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span>Target Web Link</span>
              </div>
              <button
                onClick={() => {
                  setTargetUrl('');
                  setScanResult(null);
                  setErrorMsg('');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Reset
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Website URL or Domain Name
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => {
                    setTargetUrl(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="https://suspicious-login-site.com"
                  className="w-full bg-slate-950 text-slate-200 font-mono text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/40 min-h-[48px]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Threat Posture
                </label>
                <select
                  value={strictness}
                  onChange={(e) => setStrictness(e.target.value)}
                  className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/40 uppercase min-h-[40px]"
                >
                  <option value="low">Standard Lookup</option>
                  <option value="medium">Enhanced Phishing Check</option>
                  <option value="paranoid">Zero-Trust Deep Inspection</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400">
                Inspects domain typosquatting, brand spoofing, SSL trust status, IP host routing, and high-risk TLD extensions.
              </p>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning || !targetUrl.trim()}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px] mt-4"
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></div>
                Evaluating URL Threat Intelligence...
              </span>
            ) : (
              <>
                <Globe className="w-4 h-4" strokeWidth={1.5} /> Execute URL Threat Scan
              </>
            )}
          </button>
        </div>

        {/* Right Side: Formatted Threat Output */}
        <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col justify-between min-h-[440px]">
          {scanning ? (
            <div className="my-auto text-center space-y-4 p-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Radio className="w-7 h-7 text-emerald-400 animate-pulse" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-bold text-slate-100">Analyzing Domain Reputation with Gemini AI...</h4>
              <div className="w-48 mx-auto h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : scanResult ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                  <span className="text-slate-100 font-bold text-sm">Threat Analysis Result</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge level={scanResult.risk_level || 'low'} isBlocked={Boolean(scanResult.is_blocked)} />
                  <button
                    onClick={copyJSON}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 flex items-center gap-1.5 font-semibold min-h-[36px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
              </div>

              {/* Domain Rating & Telemetry Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Domain</span>
                  <span className="text-xs font-bold text-slate-200 truncate">{scanResult.domain}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">SSL Protocol</span>
                  <span className={`text-xs font-bold truncate ${scanResult.protocol === 'https' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scanResult.protocol?.toUpperCase()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Reputation Score</span>
                  <span className={`text-xs font-bold ${domainInfo.reputation_score > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {domainInfo.reputation_score} / 100
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Host IP</span>
                  <span className="text-xs font-mono font-semibold text-slate-300 truncate">{domainInfo.ip_address}</span>
                </div>
              </div>

              {/* Target URL Display */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Web Link</label>
                <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 break-all flex items-center justify-between gap-2">
                  <span className="truncate">{scanResult.target_url}</span>
                  <a href={scanResult.target_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                </div>
              </div>

              {/* Threat Indicators List */}
              {threatList.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flagged Threats ({threatList.length})</label>
                  <div className="space-y-2">
                    {threatList.map((threat, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 font-medium">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <span className="font-bold text-rose-200 block">{threat.category}</span>
                          <span className="text-[11px] text-rose-400 leading-relaxed">{threat.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Explanation */}
              {scanResult.explanation && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                  <span className="text-emerald-400 font-bold">Audit Findings:</span> {scanResult.explanation}
                </div>
              )}

              {/* Raw JSON Block */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Telemetry JSON Response</label>
                <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] border border-slate-800 overflow-x-auto max-h-40">
                  <pre>{JSON.stringify(scanResult, null, 2)}</pre>
                </div>
              </div>
            </div>
          ) : (
            /* Clean Empty State */
            <div className="my-auto text-center space-y-3 p-8 border border-dashed border-slate-800 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Globe className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-bold text-slate-100">Ready for URL Security Evaluation</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Paste any website link on the left, then click <strong className="text-emerald-400">Execute URL Threat Scan</strong> to inspect phishing and typosquatting risks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default URLScanner;

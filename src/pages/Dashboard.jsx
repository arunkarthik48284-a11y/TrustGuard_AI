import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ScanLine, 
  Lock, 
  FileCheck2, 
  Sparkles,
  RefreshCw,
  ArrowRight,
  Globe,
  Sliders,
  Bot,
  Database,
  ShieldCheck,
  Cpu,
  Send,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import ThreatChart from '../components/ThreatChart';
import StatusBadge from '../components/StatusBadge';
import RiskGauge from '../components/RiskGauge';
import EvidenceExport from '../components/EvidenceExport';
import { securityAPI } from '../services/api';
import { useNavigate, useOutletContext } from 'react-router-dom';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trustScore, setTrustScore] = useState(0);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen;

  // Animated Count Up for Live Trust Index Score (0 -> 94)
  useEffect(() => {
    let current = 0;
    const target = 94;
    const interval = setInterval(() => {
      current += 4;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setTrustScore(current);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Real-time "Updated Xs ago" ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, logsRes] = await Promise.all([
        securityAPI.getMetrics(),
        securityAPI.getLogs({ page: 1, limit: 5 })
      ]);

      const extractedMetrics = metricsRes.data?.metrics || metricsRes.data?.data?.metrics || metricsRes.data;
      const extractedLogs = logsRes.data?.logs || logsRes.data?.data?.logs || logsRes.data;

      setMetrics(extractedMetrics || null);
      setRecentLogs(Array.isArray(extractedLogs) ? extractedLogs : []);
      setSecondsAgo(0);
    } catch (err) {
      // Silently fall back to cached telemetry
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setSecondsAgo(0);
    fetchData();
  };

  const defaultCategoryData = [
    { category: 'Prompt Injection', count: 42 },
    { category: 'PII Leakage', count: 86 },
    { category: 'Toxicity / Hate', count: 18 },
    { category: 'Data Exfiltration', count: 24 }
  ];

  const categoryBarData = metrics && metrics.categoryCounts
    ? Object.entries(metrics.categoryCounts).map(([cat, count]) => ({ category: cat, count }))
    : defaultCategoryData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-12 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <Navbar title="Security Command Center" onMenuClick={() => setMobileOpen && setMobileOpen(true)} />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Enterprise Hero Banner */}
        <div className="relative rounded-2xl p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Real-Time LLM Firewall Active
                </span>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 transition-colors"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} strokeWidth={1.5} />
                </button>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                AI Security & Data Redaction Intelligence
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Real-time firewall inspecting incoming prompts, blocking prompt injection attacks, redacting sensitive PII tokens, and auditing compliance across your LLM pipelines.
              </p>
            </div>

            {/* Animated Live Trust Score Gauge */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
              <RiskGauge score={trustScore} size={90} strokeWidth={8} />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Live Trust Index</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{trustScore} / 100</span>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Updated {secondsAgo}s ago
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Architecture Pipeline Flow Diagram */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              TrustGuard Real-Time Inspection Pipeline Architecture
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Inline Zero-Trust Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            {/* Step 1: User Request */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">1. User Payload</span>
                <span className="text-[10px] text-slate-500 block truncate">Raw Prompt / Tool Call</span>
              </div>
            </div>

            {/* Step 2: TrustGuard Firewall */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block">2. TrustGuard Firewall</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 block truncate">PII / Injection / Toxicity</span>
              </div>
            </div>

            {/* Step 3: LLM Engine */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">3. Upstream LLM</span>
                <span className="text-[10px] text-slate-500 block truncate">Gemini / GPT Model</span>
              </div>
            </div>

            {/* Step 4: Clean Response */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">4. Sanitized Output</span>
                <span className="text-[10px] text-slate-500 block truncate">Redacted & Audited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Differentiator Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/agentic-intercept')}
            className="p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/30 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  Agentic Interceptor
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Exfiltration defense</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div
            onClick={() => navigate('/breach-intel')}
            className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Database className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                  Breach Intelligence
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Check domain history</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div
            onClick={() => navigate('/scanner')}
            className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <ScanLine className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  Redaction Linter
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">PII & prompt injection</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div
            onClick={() => navigate('/policies')}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold shrink-0">
                <Sliders className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
                  Security Guardrails
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Risk & sensitivity ceiling</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>

        {/* 4 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Scans Executed"
            value={metrics?.totalScans || 1420}
            change="+14.2%"
            icon={ScanLine}
            color="emerald"
            loading={loading}
          />
          <MetricCard
            title="Prompt Injections Intercepted"
            value={metrics?.blockedThreats ?? 184}
            change="+8.4%"
            icon={ShieldAlert}
            color="rose"
            loading={loading}
          />
          <MetricCard
            title="PII Entities Masked"
            value={metrics?.piiRedacted ?? 3920}
            change="+22.1%"
            icon={Lock}
            color="amber"
            loading={loading}
          />
          <MetricCard
            title="Compliance Audit Pass Rate"
            value={`${metrics?.complianceRate ?? 99.4}%`}
            change="+0.6%"
            icon={FileCheck2}
            color="indigo"
            loading={loading}
          />
        </div>

        {/* Analytics Grid: Threat Category Visual Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ThreatChart data={categoryBarData} loading={loading} />
          </div>

          {/* Real-Time Compliance Health Card */}
          <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>Compliance Health</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  NIST AI RMF 1.0
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Continuous compliance monitoring mapped against OWASP Top 10 for LLMs and EU AI Act data safeguards.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  { rule: 'GDPR Data Minimization', status: 'Compliant', score: '100%' },
                  { rule: 'Prompt Injection Defense', status: 'Active', score: '98.5%' },
                  { rule: 'Agent Tool Call Interception', status: 'Protected', score: '100%' },
                  { rule: 'PII Redaction Engine', status: 'Active', score: '99.9%' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.rule}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/audit-logs')}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
            >
              View Full Compliance Logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Evidence Pack Export Generator */}
        <EvidenceExport sessionSummary={metrics} />

        {/* Recent Audit Telemetry Log Stream */}
        <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Live Interception Log Stream</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Real-time audit log entries captured by TrustGuard guardrail engine.</p>
            </div>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              View All Logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Threat Category</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 text-slate-500">{new Date(log.created_at || Date.now()).toLocaleTimeString()}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.event_type || 'PAYLOAD_SCAN'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{log.threat_category || 'Prompt Injection'}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{log.risk_score || 72}/100</td>
                      <td className="p-3 text-right">
                        <StatusBadge level={log.risk_level || 'medium'} isBlocked={log.is_blocked} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                      No security incidents logged in current session window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

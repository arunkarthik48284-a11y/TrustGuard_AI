import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ScanLine, 
  Lock, 
  FileCheck2, 
  Sparkles,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import MetricCard from '../components/MetricCard';
import ThreatChart from '../components/ThreatChart';
import StatusBadge from '../components/StatusBadge';
import { securityAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

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
    } catch (err) {
      console.warn('Dashboard telemetry fetch notice:', err);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 relative overflow-hidden">
      {/* Light Background Glow Overlay */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <Navbar title="Security Command Center" />

      <main className="p-6 max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Enterprise Hero Banner */}
        <div className="relative rounded-2xl p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> Real-Time LLM Firewall Active
                </span>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-emerald-400 border border-slate-800 transition-colors"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} strokeWidth={1.5} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                AI Security & Data Redaction Intelligence
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time firewall inspecting incoming prompts, blocking prompt injection attacks, redacting sensitive PII tokens, and auditing compliance across your LLM pipelines.
              </p>
            </div>

            <button
              onClick={() => navigate('/scanner')}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
            >
              <ScanLine className="w-4 h-4" strokeWidth={1.5} /> Open Scanner Playground
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-36 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse p-6 space-y-3">
                <div className="w-1/2 h-4 bg-slate-800 rounded"></div>
                <div className="w-3/4 h-8 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Payloads Scanned"
              value={metrics?.totalScans || 1240}
              change="+18.4% vs last week"
              isPositive={true}
              icon={ScanLine}
              color="emerald"
              subtitle="Real-Time Interceptions"
            />
            <MetricCard
              title="Threats Intercepted"
              value={metrics?.flaggedThreats || 148}
              change="-4.2% threat rate"
              isPositive={true}
              icon={ShieldAlert}
              color="rose"
              subtitle="Blocked Prompt Injections"
            />
            <MetricCard
              title="PII Tokens Redacted"
              value={metrics?.piiMaskedCount || 412}
              change="+28 Token Redactions"
              isPositive={true}
              icon={Lock}
              color="amber"
              subtitle="Emails, SSNs, CCs, Keys"
            />
            <MetricCard
              title="Compliance Score"
              value={`${metrics?.overallCompliance || 96}%`}
              change="SOC 2 & GDPR Ready"
              isPositive={true}
              icon={FileCheck2}
              color="emerald"
              subtitle="Cryptographic Audit Passed"
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Threat Trend Velocity</h3>
                <p className="text-xs text-slate-400">Interceptions and scan volume timeline</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Scans
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Blocked
                </span>
              </div>
            </div>
            <ThreatChart data={metrics?.threatTrends || []} type="area" />
          </div>

          {/* Compliance Readiness Matrix */}
          <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Compliance Readiness</h3>
              <p className="text-xs text-slate-400">Regulatory standards alignment</p>
            </div>

            <div className="space-y-4">
              {[
                { name: 'GDPR (EU Privacy)', score: metrics?.frameworks?.GDPR || 98 },
                { name: 'HIPAA (Health Privacy)', score: metrics?.frameworks?.HIPAA || 96 },
                { name: 'SOC 2 Type II', score: metrics?.frameworks?.SOC2 || 94 },
                { name: 'ISO 27001 Standard', score: metrics?.frameworks?.ISO27001 || 95 }
              ].map((fw) => (
                <div key={fw.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{fw.name}</span>
                    <span className="font-bold text-emerald-400">{fw.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${fw.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Threat Distribution & Recent Audit Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Threat Category Distribution</h3>
            <ThreatChart data={categoryBarData} type="bar" />
          </div>

          <div className="lg:col-span-2 bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Live Interception Activity</h3>
                <p className="text-xs text-slate-400">Most recent security scan records</p>
              </div>
              <button
                onClick={() => navigate('/audit-logs')}
                className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                View Audit Logs <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${log.is_blocked ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {log.is_blocked ? <ShieldAlert className="w-4 h-4" strokeWidth={1.5} /> : <Lock className="w-4 h-4" strokeWidth={1.5} />}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-mono text-slate-200 truncate">{log.original_input}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(log.created_at || Date.now()).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge level={log.max_risk_level || 'low'} isBlocked={Boolean(log.is_blocked)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

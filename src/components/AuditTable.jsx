import React, { useState } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  X,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';

const AuditTable = ({ logs = [], loading = false, pagination = {}, onPageChange, onFilterChange }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onFilterChange) {
      onFilterChange({ search: e.target.value, riskLevel: filterLevel });
    }
  };

  const handleFilterClick = (lvl) => {
    setFilterLevel(lvl);
    if (onFilterChange) {
      onFilterChange({ search: searchTerm, riskLevel: lvl });
    }
  };

  const exportCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = ['Log ID', 'Timestamp', 'Original Input', 'Processed Output', 'Risk Score', 'Risk Level', 'Blocked', 'PII Count', 'Threats Count'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.created_at || Date.now()).toISOString(),
      `"${(l.original_input || '').replace(/"/g, '""')}"`,
      `"${(l.processed_output || '').replace(/"/g, '""')}"`,
      l.risk_score || 0,
      l.max_risk_level || 'low',
      l.is_blocked ? 'YES' : 'NO',
      Array.isArray(l.pii_detected) ? l.pii_detected.length : 0,
      Array.isArray(l.threats_detected) ? l.threats_detected.length : 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trustguard_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search audit logs by payload, log ID, or threat..."
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500/50 min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Export Report Button */}
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs transition-colors border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 min-h-[44px] w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'critical', 'high', 'medium', 'low'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleFilterClick(lvl)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[38px] shrink-0 ${
              filterLevel === lvl
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
                : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Audit Log Table Container */}
      <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold text-xs">
            Loading security audit trail...
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Security Audit Logs Found"
            description="No active security scan records match your search or risk filter parameters."
            actionLabel="Reset Search Filters"
            onAction={() => {
              setSearchTerm('');
              setFilterLevel('all');
              if (onFilterChange) onFilterChange({ search: '', riskLevel: 'all' });
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Log ID & Timestamp</th>
                  <th className="py-3.5 px-4">Payload Input Snippet</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Status / Risk Level</th>
                  <th className="py-3.5 px-4">Redacted Tokens</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-800 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">{(log.id || '').slice(0, 16)}...</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{new Date(log.created_at || Date.now()).toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-mono text-slate-700 dark:text-slate-300">
                      {log.original_input}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2.5 py-1 rounded text-xs font-mono ${
                        (log.risk_score || 0) >= 70 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-500/30' 
                          : 'bg-slate-100 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800'
                      }`}>
                        {log.risk_score || 0} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge level={log.max_risk_level || 'low'} isBlocked={Boolean(log.is_blocked)} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {Array.isArray(log.pii_detected) ? log.pii_detected.length : 0} PII token(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-colors inline-flex items-center gap-1.5 font-semibold min-h-[36px]"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              Page <strong className="text-slate-900 dark:text-slate-100">{pagination.page}</strong> of <strong className="text-slate-900 dark:text-slate-100">{pagination.totalPages}</strong> ({pagination.total} logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 disabled:opacity-40 min-h-[36px]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 disabled:opacity-40 min-h-[36px]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Log Detail Modal Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Security Scan Audit Record</h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{selectedLog.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Risk Level</span>
                <StatusBadge level={selectedLog.max_risk_level || 'low'} isBlocked={Boolean(selectedLog.is_blocked)} />
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Risk Score</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{selectedLog.risk_score || 0} / 100</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Action Taken</span>
                <span className={`font-bold ${selectedLog.is_blocked ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {selectedLog.is_blocked ? 'BLOCKED Payload' : 'PROCESSED & Masked'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="text-slate-800 dark:text-slate-300 font-mono">{new Date(selectedLog.created_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">Original Input Payload</label>
                <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedLog.original_input}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">Sanitized Output Payload</label>
                <div className="bg-slate-900 text-emerald-400 text-xs font-mono p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedLog.processed_output}
                </div>
              </div>

              {Array.isArray(selectedLog.pii_detected) && selectedLog.pii_detected.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">PII Masked Tokens</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLog.pii_detected.map((p, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono">
                        [{p.type || 'PII'}] {p.value || JSON.stringify(p)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 min-h-[44px]"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTable;

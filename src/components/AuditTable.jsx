import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  ShieldAlert, 
  Lock, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight,
  FileCheck2,
  Inbox
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const AuditTable = ({ logs = [], loading = false, pagination = {}, onPageChange, onFilterChange }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onFilterChange) {
      onFilterChange({ search: val, riskLevel: riskFilter });
    }
  };

  const handleRiskChange = (level) => {
    setRiskFilter(level);
    if (onFilterChange) {
      onFilterChange({ search: searchTerm, riskLevel: level });
    }
  };

  const exportCSV = () => {
    if (!logs.length) return;

    const headers = ['ID,Timestamp,Original Input,Risk Score,Risk Level,Blocked,PII Count'];
    const rows = logs.map(log => 
      `"${log.id}","${new Date(log.created_at).toISOString()}","${(log.original_input || '').replace(/"/g, '""')}",${log.risk_score},"${log.max_risk_level}",${log.is_blocked},${(log.pii_detected || []).length}`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trustguard_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search prompt payload text, PII, or log ID..."
            className="w-full bg-[#0B0F19] text-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'low', 'medium', 'high', 'critical'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleRiskChange(lvl)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                riskFilter === lvl
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
            >
              {lvl}
            </button>
          ))}

          <button
            onClick={exportCSV}
            disabled={!logs.length}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-cyan-300 border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          /* Table Skeleton Loader */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-900/60 rounded-xl animate-pulse flex items-center px-4 justify-between">
                <div className="w-1/3 h-4 bg-gray-800 rounded"></div>
                <div className="w-1/6 h-4 bg-gray-800 rounded"></div>
                <div className="w-1/6 h-4 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
              <Inbox className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-white">No Audit Logs Found</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchTerm || riskFilter !== 'all'
                ? 'No log records match your current filter query. Try clearing filters.'
                : 'Scanned AI prompts and PII detections will appear here automatically.'}
            </p>
          </div>
        ) : (
          /* Table Content */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Input Payload</th>
                    <th className="p-4">Risk Evaluation</th>
                    <th className="p-4">PII Tokens</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="p-4 text-gray-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 max-w-xs truncate font-mono text-gray-200">
                        {log.original_input}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-400 font-mono">{log.risk_score}/100</span>
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">({log.max_risk_level})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {(log.pii_detected || []).length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30 text-[10px] font-mono">
                            {(log.pii_detected || []).length} PII
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Clean</span>
                        )}
                      </td>
                      <td className="p-4">
                        <StatusBadge level={log.max_risk_level} isBlocked={log.is_blocked} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-cyan-950 text-cyan-400 border border-gray-800 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-gray-800">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                    <StatusBadge level={log.max_risk_level} isBlocked={log.is_blocked} />
                  </div>
                  <p className="text-xs font-mono text-gray-200 line-clamp-2">{log.original_input}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono text-cyan-400 font-bold">Score: {log.risk_score}/100</span>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1 rounded-lg bg-gray-900 text-cyan-400 border border-gray-800 text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 bg-gray-900/60 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong></span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-gray-800 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Log Inspection Details</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase">Risk Score</span>
                  <span className="text-cyan-400 font-bold text-sm">{selectedLog.risk_score}/100</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase">Risk Level</span>
                  <span className="text-gray-200 font-bold capitalize">{selectedLog.max_risk_level}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase">Status</span>
                  <span className={selectedLog.is_blocked ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedLog.is_blocked ? 'Blocked' : 'Passed'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase">PII Redacted</span>
                  <span className="text-violet-400 font-bold">{(selectedLog.pii_detected || []).length} tokens</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Raw Input Prompt Payload</label>
                <div className="p-3.5 rounded-xl bg-[#0B0F19] text-gray-200 font-mono text-xs border border-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedLog.original_input}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Processed / Masked Output Payload</label>
                <div className="p-3.5 rounded-xl bg-[#0B0F19] text-gray-200 font-mono text-xs border border-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedLog.processed_output || selectedLog.original_input}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTable;

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileSpreadsheet,
  X
} from 'lucide-react';
import StatusBadge from './StatusBadge';

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search audit logs by payload content, log ID, or threat category..."
            className="w-full bg-[#0B0F19] text-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Export Report Button */}
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-400 font-semibold text-xs transition-colors border border-gray-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'critical', 'high', 'medium', 'low'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleFilterClick(lvl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              filterLevel === lvl
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'bg-gray-900/60 text-gray-400 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19]/90 text-gray-400 font-semibold border-b border-gray-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Log ID & Timestamp</th>
                <th className="py-3.5 px-4">Payload Input Snippet</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Status / Risk Level</th>
                <th className="py-3.5 px-4">Redacted Tokens</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No security audit logs found for current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="font-semibold text-cyan-400">{(log.id || '').slice(0, 16)}...</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{new Date(log.created_at || Date.now()).toLocaleString()}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-mono text-gray-300">
                      {log.original_input}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        (log.risk_score || 0) >= 70 ? 'bg-rose-950 text-rose-400' : 'bg-gray-800 text-cyan-400'
                      }`}>
                        {log.risk_score || 0} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge level={log.max_risk_level || 'low'} isBlocked={Boolean(log.is_blocked)} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-gray-400 font-medium">
                        {Array.isArray(log.pii_detected) ? log.pii_detected.length : 0} PII token(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 border border-gray-700 transition-colors inline-flex items-center gap-1 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-800 bg-[#0B0F19]/50 flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing Page <strong className="text-white">{pagination.page}</strong> of <strong className="text-white">{pagination.totalPages}</strong> ({pagination.total} total logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Log Detail Modal Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Security Scan Audit Record</h3>
                <p className="text-xs font-mono text-gray-400">{selectedLog.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Risk Level</span>
                <StatusBadge level={selectedLog.max_risk_level || 'low'} isBlocked={Boolean(selectedLog.is_blocked)} />
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Risk Score</span>
                <span className="font-extrabold text-white text-sm">{selectedLog.risk_score || 0} / 100</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Action Taken</span>
                <span className={`font-bold ${selectedLog.is_blocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedLog.is_blocked ? 'BLOCKED Payload' : 'PROCESSED & Masked'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Timestamp</span>
                <span className="text-gray-200 font-mono">{new Date(selectedLog.created_at || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Original Input Payload</label>
                <div className="bg-[#0B0F19] text-gray-200 text-xs font-mono p-3 rounded-xl border border-gray-800 whitespace-pre-wrap">
                  {selectedLog.original_input}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Sanitized Output Payload</label>
                <div className="bg-[#0B0F19] text-emerald-400 text-xs font-mono p-3 rounded-xl border border-gray-800 whitespace-pre-wrap">
                  {selectedLog.processed_output}
                </div>
              </div>

              {Array.isArray(selectedLog.pii_detected) && selectedLog.pii_detected.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">PII Masked Tokens</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLog.pii_detected.map((p, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
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
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold"
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

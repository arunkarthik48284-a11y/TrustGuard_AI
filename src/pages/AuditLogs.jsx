import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuditTable from '../components/AuditTable';
import { securityAPI } from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', riskLevel: 'all' });

  const fetchLogs = async (page = 1, filterOptions = filters) => {
    setLoading(true);
    try {
      const res = await securityAPI.getLogs({
        page,
        limit: 10,
        risk_level: filterOptions.riskLevel,
        search: filterOptions.search
      });
      setLogs(res.data.logs || []);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, filters);
  }, []);

  const handlePageChange = (newPage) => {
    fetchLogs(newPage, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchLogs(1, newFilters);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 pb-12">
      <Navbar title="Audit Logs & Compliance Hub" />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Cryptographic Security Audit Trail</h2>
          <p className="text-xs text-gray-400 mt-1">
            Chronological log of all evaluated AI prompts, redacted PII tokens, flagged injection attempts, and exportable reports.
          </p>
        </div>

        <AuditTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
        />
      </main>
    </div>
  );
};

export default AuditLogs;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuditTable from '../components/AuditTable';
import { securityAPI } from '../services/api';
import { useOutletContext } from 'react-router-dom';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen;

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    try {
      const res = await securityAPI.getLogs(params);
      const data = res.data?.logs || res.data?.data?.logs || res.data;
      const meta = res.data?.pagination || res.data?.data?.pagination || { page: 1, totalPages: 1, total: Array.isArray(data) ? data.length : 0 };

      setLogs(Array.isArray(data) ? data : []);
      setPagination(meta);
    } catch (err) {
      console.warn('Audit log fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200 pb-12">
      <Navbar title="Audit Logs & Compliance Trail" onMenuClick={() => setMobileOpen && setMobileOpen(true)} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <AuditTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => fetchLogs({ page })}
          onFilterChange={(filters) => fetchLogs(filters)}
        />
      </main>
    </div>
  );
};

export default AuditLogs;

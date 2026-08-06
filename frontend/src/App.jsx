import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Policies from './pages/Policies';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Initializing TrustGuard Engine...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback wildcard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import URLScannerPage from './pages/URLScannerPage';
import Policies from './pages/Policies';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
          <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Initializing TrustGuard Engine...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200 font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 overflow-x-hidden w-full">
        <Outlet context={{ setMobileOpen }} />
      </div>
    </div>
  );
};

// Helper hook for pages to get setMobileOpen easily
export function useMobileMenu() {
  return useOutletContext();
}

const App = () => {
  return (
    <ThemeProvider>
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
              <Route path="/url-scanner" element={<URLScannerPage />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback wildcard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

import React from 'react';
import Navbar from '../components/Navbar';
import URLScanner from '../components/URLScanner';
import { useOutletContext } from 'react-router-dom';

const URLScannerPage = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar title="URL Security & Phishing Scanner" onMenuClick={() => setMobileOpen && setMobileOpen(true)} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <URLScanner />
      </main>
    </div>
  );
};

export default URLScannerPage;

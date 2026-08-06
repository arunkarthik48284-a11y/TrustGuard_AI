import React from 'react';
import Navbar from '../components/Navbar';
import ScanPlayground from '../components/ScanPlayground';

const Scanner = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar title="AI Guardrail Scanner" />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <ScanPlayground />
      </main>
    </div>
  );
};

export default Scanner;

import React from 'react';
import Navbar from '../components/Navbar';
import PolicyEditor from '../components/PolicyEditor';
import { useOutletContext } from 'react-router-dom';

const Policies = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen;

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200 pb-12">
      <Navbar title="Security Policy Management" onMenuClick={() => setMobileOpen && setMobileOpen(true)} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <PolicyEditor />
      </main>
    </div>
  );
};

export default Policies;

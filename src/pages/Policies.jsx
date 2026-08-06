import React from 'react';
import Navbar from '../components/Navbar';
import PolicyEditor from '../components/PolicyEditor';

const Policies = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      <Navbar title="Security Policy Management" />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <PolicyEditor />
      </main>
    </div>
  );
};

export default Policies;

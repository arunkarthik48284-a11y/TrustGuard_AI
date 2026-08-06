import React from 'react';
import Navbar from '../components/Navbar';
import PolicyEditor from '../components/PolicyEditor';

const Policies = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 pb-12">
      <Navbar title="Security Policy Management" />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Organization Policy Builder</h2>
          <p className="text-xs text-gray-400 mt-1">
            Define global threat sensitivity levels, prompt injection thresholds, and PII masking rules.
          </p>
        </div>

        <PolicyEditor />
      </main>
    </div>
  );
};

export default Policies;

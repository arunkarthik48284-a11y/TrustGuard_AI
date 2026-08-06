import React from 'react';
import Navbar from '../components/Navbar';
import ScanPlayground from '../components/ScanPlayground';

const Scanner = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 pb-12">
      <Navbar title="Interactive Security Scanner & Guardrails" />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">AI Guardrail Firewall Playground</h2>
          <p className="text-xs text-gray-400 mt-1">
            Test custom text payloads, prompt injection attacks, and PII redaction rules live against Google Gemini security models.
          </p>
        </div>

        <ScanPlayground />
      </main>
    </div>
  );
};

export default Scanner;

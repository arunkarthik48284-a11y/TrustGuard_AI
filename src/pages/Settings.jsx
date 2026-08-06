import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Key, Building, ShieldCheck, Copy, Check, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('tg_live_99a8b7c6d5e4f3a2b1_prod_key');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.acmesecurity.io/webhooks/trustguard');

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = () => {
    const newKey = `tg_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setApiKey(newKey);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 pb-12">
      <Navbar title="Settings & API Key Management" />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white">Organization Settings</h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage your API authorization keys, security webhooks, and team access credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Key Management */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">TrustGuard SDK API Key</h3>
            </div>
            <p className="text-xs text-gray-400">
              Use this bearer secret key to authenticate your backend server requests to the TrustGuard AI Security Engine API.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">Production Key</label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full bg-[#0B0F19] text-cyan-300 font-mono text-xs p-3 rounded-xl border border-gray-800 focus:outline-none"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={copyKey}
                  className="p-3 rounded-xl bg-gray-800 text-cyan-400 hover:text-cyan-300 border border-gray-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={regenerateKey}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-rose-950 text-rose-400 border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Roll Secret Key
              </button>
              <span className="text-[10px] text-gray-500">Created: Aug 06, 2026</span>
            </div>
          </div>

          {/* Webhooks & Incident Alerts */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Real-Time Incident Webhooks</h3>
            </div>
            <p className="text-xs text-gray-400">
              Receive instant JSON webhook notifications whenever a critical prompt injection or data breach payload is blocked.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">Webhook Endpoint URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks/security"
                className="w-full bg-[#0B0F19] text-gray-200 font-mono text-xs p-3 rounded-xl border border-gray-800 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20">
                <Save className="w-3.5 h-3.5" /> Save Webhook URL
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

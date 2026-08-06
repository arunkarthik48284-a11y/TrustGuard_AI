import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Key, ShieldCheck, Copy, Check, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('tg_live_99a8b7c6d5e4f3a2b1_prod_key');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.acmesecurity.io/webhooks/trustguard');
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen;

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
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200 pb-12">
      <Navbar title="Settings & API Key Management" onMenuClick={() => setMobileOpen && setMobileOpen(true)} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">Organization Settings</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
            Manage your API authorization keys, security webhooks, and team access credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Key Management */}
          <div className="bg-slate-900/70 dark:bg-slate-900/70 light:bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">TrustGuard SDK API Key</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              Use this bearer secret key to authenticate your backend server requests to the TrustGuard AI Security Engine API.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 block">Production Key</label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 focus:outline-none min-h-[44px]"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-3 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-slate-800 dark:border-slate-800 light:border-slate-200 min-h-[44px] flex items-center justify-center shrink-0"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={copyKey}
                  className="p-3 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 text-emerald-400 hover:text-emerald-300 border border-slate-800 dark:border-slate-800 light:border-slate-200 min-h-[44px] flex items-center justify-center shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={regenerateKey}
                className="px-3.5 py-2 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-100 hover:bg-rose-950 text-rose-400 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Roll Secret Key
              </button>
              <span className="text-[10px] text-slate-500">Created: Aug 06, 2026</span>
            </div>
          </div>

          {/* Webhooks & Incident Alerts */}
          <div className="bg-slate-900/70 dark:bg-slate-900/70 light:bg-white backdrop-blur-md p-6 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">Real-Time Incident Webhooks</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              Receive instant JSON webhook notifications whenever a critical prompt injection or data breach payload is blocked.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 block">Webhook Endpoint URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks/security"
                className="w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono text-xs p-3 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 focus:outline-none focus:border-indigo-500/50 min-h-[44px]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 min-h-[44px]">
                <Save className="w-4 h-4" /> Save Webhook URL
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

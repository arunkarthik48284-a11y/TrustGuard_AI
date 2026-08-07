import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Key, ShieldCheck, Copy, Check, Eye, EyeOff, Save, RefreshCw, Radio, Sparkles, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const { user, isDemoMode, setCustomApiKey } = useAuth();
  const [apiKeyInput, setApiKeyInput] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('trustguard_live_api_key') || '' : ''
  );
  const [hibpKeyInput, setHibpKeyInput] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('hibp_api_key') || '' : ''
  );
  const [showKey, setShowKey] = useState(false);
  const [showHibpKey, setShowHibpKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedKeyMsg, setSavedKeyMsg] = useState('');
  const [savedHibpKeyMsg, setSavedHibpKeyMsg] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://api.acmesecurity.io/webhooks/trustguard');
  const [savedWebhookMsg, setSavedWebhookMsg] = useState(false);
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen;

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      setCustomApiKey('');
      setSavedKeyMsg('Switched to Interactive Demo Mode.');
    } else {
      setCustomApiKey(apiKeyInput);
      setSavedKeyMsg('Live Protection API Key saved and activated!');
    }
    setTimeout(() => setSavedKeyMsg(''), 3000);
  };

  const handleSaveHibpKey = () => {
    if (!hibpKeyInput.trim()) {
      localStorage.removeItem('hibp_api_key');
      setSavedHibpKeyMsg('Removed HIBP key. Operating in simulated threat intelligence fallback mode.');
    } else {
      localStorage.setItem('hibp_api_key', hibpKeyInput.trim());
      setSavedHibpKeyMsg('Have I Been Pwned API Key saved! Real breach lookups activated.');
    }
    setTimeout(() => setSavedHibpKeyMsg(''), 3000);
  };

  const copyKey = () => {
    if (!apiKeyInput) return;
    navigator.clipboard.writeText(apiKeyInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewKey = () => {
    const newKey = `tg_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setApiKeyInput(newKey);
  };

  const handleSaveWebhook = () => {
    setSavedWebhookMsg(true);
    setTimeout(() => setSavedWebhookMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-12">
      <Navbar title="Settings & API Key Management" onMenuClick={() => setMobileOpen && setMobileOpen(true)} />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Organization Settings</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Manage your API authorization keys, breach threat intelligence integrations, and active firewall posture.
            </p>
          </div>

          {/* Persistent Mode Indicator Badge */}
          {isDemoMode ? (
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Operating in Demo Mode</span>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Live Protection Mode Active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Key Management */}
          <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">TrustGuard Security Engine API Key</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Inject your backend bearer secret key to switch from Demo Mode to Live Protection. Leave empty to use sample guardrail rules.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Bearer Secret Key</label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste tg_live_... key or leave empty for Demo Mode"
                  className="w-full bg-slate-50 dark:bg-slate-950 text-emerald-700 dark:text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500/40 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 min-h-[44px] flex items-center justify-center shrink-0"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={copyKey}
                  disabled={!apiKeyInput}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 min-h-[44px] flex items-center justify-center shrink-0 disabled:opacity-40"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {savedKeyMsg && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                  {savedKeyMsg}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={generateNewKey}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[40px]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Generate Key
              </button>

              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 min-h-[40px]"
              >
                <Save className="w-4 h-4" /> Save API Key
              </button>
            </div>
          </div>

          {/* Breach Intelligence HIBP API Key Card */}
          <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Breach Intelligence API Key</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Configure your <strong>Have I Been Pwned (HIBP v3)</strong> API key to query live breach databases. Leave empty to use simulated threat modeling.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">HIBP API v3 Key</label>
              <div className="flex items-center gap-2">
                <input
                  type={showHibpKey ? 'text' : 'password'}
                  value={hibpKeyInput}
                  onChange={(e) => setHibpKeyInput(e.target.value)}
                  placeholder="Paste HIBP API key or leave empty for simulated fallback"
                  className="w-full bg-slate-50 dark:bg-slate-950 text-amber-700 dark:text-amber-400 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-amber-500/40 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowHibpKey(!showHibpKey)}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 min-h-[44px] flex items-center justify-center shrink-0"
                >
                  {showHibpKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {savedHibpKeyMsg && (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 animate-fadeIn">
                  {savedHibpKeyMsg}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveHibpKey}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 min-h-[40px]"
              >
                <Save className="w-4 h-4" /> Save Breach Intel Key
              </button>
            </div>
          </div>

          {/* Webhooks & Incident Alerts */}
          <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Real-Time Incident Webhooks</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Receive instant JSON webhook notifications whenever a critical prompt injection or data breach payload is blocked.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Webhook Endpoint URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks/security"
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500/50 min-h-[44px]"
              />
              {savedWebhookMsg && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Webhook URL updated successfully.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 min-h-[44px]"
              >
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

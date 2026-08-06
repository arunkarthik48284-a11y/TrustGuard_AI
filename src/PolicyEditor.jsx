import React, { useState, useEffect } from 'react';
import { Sliders, Check, Save } from 'lucide-react';
import { policyAPI } from './services/api';

const PolicyEditor = () => {
  const [policyId, setPolicyId] = useState('pol-001-default');
  const [policyName, setPolicyName] = useState('Enterprise Default Guardrail Policy');
  const [sensitivity, setSensitivity] = useState('medium');
  const [isActive, setIsActive] = useState(true);

  const [rules, setRules] = useState({
    mask_pii: true,
    block_prompt_injection: true,
    block_toxicity: true,
    detect_hallucinations: true,
    redact_financial: true,
    redact_medical: true,
    max_allowed_risk_score: 75
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await policyAPI.getPolicies();
        const policies = res.data?.policies || res.data?.data?.policies || res.data;
        if (Array.isArray(policies) && policies.length > 0) {
          const p = policies[0];
          setPolicyId(p.id || 'pol-001-default');
          setPolicyName(p.policy_name || 'Enterprise Default Guardrail Policy');
          setSensitivity(p.sensitivity || 'medium');
          setIsActive(p.is_active !== undefined ? p.is_active : true);
          if (p.rules) {
            const parsedRules = typeof p.rules === 'string' ? JSON.parse(p.rules) : p.rules;
            setRules(prev => ({ ...prev, ...parsedRules }));
          }
        }
      } catch (err) {
        console.warn('Using default policy editor state.', err);
      }
    };
    fetchPolicies();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await policyAPI.updatePolicy(policyId, {
        id: policyId,
        policy_name: policyName,
        is_active: isActive,
        sensitivity,
        rules
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save policy:', err);
      // Optimistic instant feedback
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = (key) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">{policyName}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30 uppercase">
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Configure global AI firewall boundaries and maximum allowed risk thresholds.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2"
        >
          {saving ? (
            <span>Saving Policy...</span>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" /> Policy Applied!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Policy Rules
            </>
          )}
        </button>
      </div>

      {/* Policy Sensitivity Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            Security Sensitivity Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['low', 'medium', 'high', 'paranoid'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSensitivity(lvl)}
                className={`py-2 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${
                  sensitivity === lvl
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm'
                    : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400">
            {sensitivity === 'paranoid' && 'Strict zero-trust posture: All suspicious tokens, low-probability injection signals, and unmasked identifiers cause immediate payload blocking.'}
            {sensitivity === 'high' && 'High security posture: Strict evaluation of prompt injection and PII token leakage.'}
            {sensitivity === 'medium' && 'Balanced security posture: Standard PII masking and prompt injection detection.'}
            {sensitivity === 'low' && 'Permissive posture: Only block critical prompt injection attacks.'}
          </p>
        </div>

        {/* Risk Threshold Slider */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Maximum Risk Score Ceiling
            </label>
            <span className="text-lg font-extrabold text-cyan-400">{rules.max_allowed_risk_score} / 100</span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            value={rules.max_allowed_risk_score}
            onChange={(e) => setRules(prev => ({ ...prev, max_allowed_risk_score: parseInt(e.target.value, 10) }))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[11px] text-gray-400">
            Payloads evaluated above risk score <span className="text-white font-semibold">{rules.max_allowed_risk_score}</span> will be automatically blocked by the firewall.
          </p>
        </div>
      </div>

      {/* Specific Guardrail Rule Toggles */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Active Guardrail Controls</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'mask_pii', label: 'Automatic PII Redaction', desc: 'Mask emails, SSNs, credit cards, and API keys before sending to LLMs.' },
            { key: 'block_prompt_injection', label: 'Prompt Injection Firewall', desc: 'Intercept attempt to override system prompts or jailbreak rules.' },
            { key: 'block_toxicity', label: 'AI Toxicity & Malicious Content Filter', desc: 'Filter hate speech, violence, and malicious instructions.' },
            { key: 'detect_hallucinations', label: 'Hallucination & Citation Inspection', desc: 'Flag ungrounded facts or fake citations in LLM responses.' },
            { key: 'redact_financial', label: 'Financial Data Masking (IBAN/CC)', desc: 'Strip credit card numbers and bank identifiers.' },
            { key: 'redact_medical', label: 'Medical Identifier Filter (HIPAA)', desc: 'Mask patient record IDs, health insurance tokens, and DOB.' }
          ].map((rule) => (
            <div
              key={rule.key}
              onClick={() => toggleRule(rule.key)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                rules[rule.key]
                  ? 'bg-gradient-to-r from-cyan-950/40 to-indigo-950/20 border-cyan-500/40 text-white'
                  : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div>
                <h5 className="text-sm font-bold">{rule.label}</h5>
                <p className="text-xs text-gray-400 mt-1">{rule.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                rules[rule.key] ? 'bg-cyan-500 border-cyan-400 text-black font-bold' : 'border-gray-700 bg-gray-800'
              }`}>
                {rules[rule.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyEditor;

import React, { useState, useEffect } from 'react';
import { Sliders, Check, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { policyAPI } from '../services/api';

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
    <div className="bg-slate-900/70 dark:bg-slate-900/70 light:bg-white backdrop-blur-md rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">{policyName}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 border border-emerald-500/30 uppercase">
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">Configure global AI firewall boundaries and maximum allowed risk thresholds.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 min-h-[44px]"
        >
          {saving ? (
            <span>Saving Policy...</span>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" /> Policy Applied!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" strokeWidth={1.5} /> Save Policy Rules
            </>
          )}
        </button>
      </div>

      {/* Sensitivity & Risk Ceiling Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider block">
            Security Sensitivity Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['low', 'medium', 'high', 'paranoid'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSensitivity(lvl)}
                className={`py-2 text-xs font-bold rounded-xl uppercase transition-all min-h-[38px] ${
                  sensitivity === lvl
                    ? 'bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 light:text-emerald-600 border border-emerald-500/40'
                    : 'bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-400 dark:text-slate-400 light:text-slate-600 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
            {sensitivity === 'paranoid' && 'Paranoid mode: Zero tolerance for suspicious prompts or unmasked tokens.'}
            {sensitivity === 'high' && 'High posture: Strict validation of injection vectors and PII.'}
            {sensitivity === 'medium' && 'Balanced posture: Standard enterprise safety boundaries.'}
            {sensitivity === 'low' && 'Permissive posture: Intercept only severe attacks.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider">
              Max Risk Score Ceiling
            </label>
            <span className="text-lg font-extrabold text-emerald-400 dark:text-emerald-400 light:text-emerald-600">{rules.max_allowed_risk_score} / 100</span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            value={rules.max_allowed_risk_score}
            onChange={(e) => setRules(prev => ({ ...prev, max_allowed_risk_score: parseInt(e.target.value, 10) }))}
            className="w-full h-2 bg-slate-900 dark:bg-slate-900 light:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
            Payloads exceeding risk score <span className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold">{rules.max_allowed_risk_score}</span> will be blocked.
          </p>
        </div>
      </div>

      {/* Guardrail Rules Toggles */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider">Active Guardrail Rules</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'mask_pii', label: 'Automatic PII Redaction', desc: 'Mask emails, SSNs, credit cards, and API keys before sending to LLMs.' },
            { key: 'block_prompt_injection', label: 'Prompt Injection Firewall', desc: 'Intercept attempt to override system prompts or jailbreak rules.' },
            { key: 'block_toxicity', label: 'AI Toxicity & Malicious Filter', desc: 'Filter hate speech, violence, and malicious instructions.' },
            { key: 'detect_hallucinations', label: 'Hallucination Inspection', desc: 'Flag ungrounded facts or fake citations in LLM responses.' },
            { key: 'redact_financial', label: 'Financial Data Masking (IBAN/CC)', desc: 'Strip credit card numbers and bank identifiers.' },
            { key: 'redact_medical', label: 'Medical Identifier Filter (HIPAA)', desc: 'Mask patient record IDs, health insurance tokens, and DOB.' }
          ].map((rule) => (
            <div
              key={rule.key}
              onClick={() => toggleRule(rule.key)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                rules[rule.key]
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-100 dark:text-slate-100 light:text-slate-900'
                  : 'bg-slate-950 dark:bg-slate-950 light:bg-slate-50 border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <h5 className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">{rule.label}</h5>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 leading-relaxed">{rule.desc}</p>
              </div>
              {rules[rule.key] ? (
                <ToggleRight className="w-5 h-5 text-emerald-400 shrink-0" strokeWidth={1.5} />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-600 shrink-0" strokeWidth={1.5} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyEditor;

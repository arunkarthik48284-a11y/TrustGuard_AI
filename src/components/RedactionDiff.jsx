import React, { useMemo } from 'react';
import { Lock, CheckCircle, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const HIGH_RISK_EMAIL_PREFIXES = ['admin', 'root', 'ceo', 'cfo', 'security', 'finance', 'payroll', 'billing', 'sysadmin', 'master', 'privkey', 'hr'];
const SPAM_PHONE_PATTERNS = [/0000000000|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999|1234567890|0123456789|9876543210/];

const PII_PATTERNS = [
  { 
    type: 'HIGH_RISK_EMAIL', 
    customCheck: (val) => {
      const lower = val.toLowerCase();
      const parts = lower.split('@');
      return HIGH_RISK_EMAIL_PREFIXES.some(p => parts[0] === p || parts[0].startsWith(p + '.')) || lower.includes('.gov') || lower.includes('.mil');
    },
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 
    color: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 font-extrabold' 
  },
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
  { 
    type: 'SPAM_PHONE', 
    customCheck: (val) => {
      const digits = val.replace(/\D/g, '');
      return SPAM_PHONE_PATTERNS.some(rx => rx.test(digits));
    },
    regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, 
    color: 'bg-red-500/25 text-red-700 dark:text-red-300 border-red-500/40 font-extrabold' 
  },
  { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g, color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  { type: 'CREDIT_CARD', regex: /\b(?:\d[ -]*?){13,16}\b/g, color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  { type: 'PHONE', regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  { type: 'API_KEY', regex: /\b(?:sk-[a-zA-Z0-9]{20,}|tg_live_[a-zA-Z0-9_]{15,}|AKIA[0-9A-Z]{16})\b/g, color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  { type: 'IBAN', regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' }
];

const RedactionDiff = ({ text = '', maskedText = '', riskLevel = 'low' }) => {
  const { highlightedTokens, count, sanitizedResult } = useMemo(() => {
    if (!text) return { highlightedTokens: [], count: 0, sanitizedResult: '' };

    let matches = [];
    PII_PATTERNS.forEach((pattern) => {
      let match;
      const re = new RegExp(pattern.regex.source, 'g');
      while ((match = re.exec(text)) !== null) {
        const val = match[0];
        if (!pattern.customCheck || pattern.customCheck(val)) {
          matches.push({
            start: match.index,
            end: match.index + val.length,
            value: val,
            type: pattern.type,
            color: pattern.color
          });
        }
      }
    });

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Filter overlapping matches
    let filteredMatches = [];
    let lastEnd = 0;
    matches.forEach(m => {
      if (m.start >= lastEnd) {
        filteredMatches.push(m);
        lastEnd = m.end;
      }
    });

    // Build highlighted elements
    let elements = [];
    let lastIdx = 0;
    let sanitizedParts = [];

    filteredMatches.forEach((m, idx) => {
      if (m.start > lastIdx) {
        const plainSegment = text.slice(lastIdx, m.start);
        elements.push(<span key={`text-${idx}`}>{plainSegment}</span>);
        sanitizedParts.push(plainSegment);
      }

      elements.push(
        <mark
          key={`token-${idx}`}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[11px] font-mono font-bold mx-0.5 shadow-2xs ${m.color}`}
        >
          <Lock className="w-3 h-3 text-amber-500 shrink-0" strokeWidth={2} />
          <span>[{m.type}: {m.value}]</span>
        </mark>
      );

      sanitizedParts.push(`[REDACTED_${m.type}]`);
      lastIdx = m.end;
    });

    if (lastIdx < text.length) {
      const remaining = text.slice(lastIdx);
      elements.push(<span key="text-end">{remaining}</span>);
      sanitizedParts.push(remaining);
    }

    return {
      highlightedTokens: elements,
      count: filteredMatches.length,
      sanitizedResult: maskedText || sanitizedParts.join('')
    };
  }, [text, maskedText]);

  const level = (riskLevel || 'low').toLowerCase();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Live Linter Redaction Diff
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30">
            {count} Entity Token{count === 1 ? '' : 's'} Intercepted
          </span>
        </div>
      </div>

      {/* Side by Side Diff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Raw Input with Live Inline Highlighting */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Raw Unsanitized Payload</span>
            {level === 'high' || level === 'critical' ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High Exposure Risk
              </span>
            ) : level === 'medium' ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Medium Exposure Risk
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Low Exposure Risk
              </span>
            )}
          </div>
          <div className="font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-200 whitespace-pre-wrap min-h-[120px] max-h-60 overflow-y-auto p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {text ? highlightedTokens : <span className="text-slate-400 italic">Type or paste prompt text to see live entity highlighting...</span>}
          </div>
        </div>

        {/* Right: Sanitized Clean Output */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            <span>Sanitized Output Payload</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Compliant & Masked
            </span>
          </div>
          <div className="font-mono text-xs leading-relaxed text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap min-h-[120px] max-h-60 overflow-y-auto p-3 rounded-lg bg-slate-900 border border-slate-800">
            {text ? sanitizedResult : <span className="text-slate-500 italic">Sanitized payload output will render here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedactionDiff;

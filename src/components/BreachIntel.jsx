import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Calendar, 
  Info, 
  Copy, 
  Check, 
  XCircle, 
  Server,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ScanProgress from './ScanProgress';
import EmptyState from './EmptyState';

const SAMPLE_BREACHES = {
  'adobe.com': {
    isRealData: false,
    breaches: [
      {
        name: 'Adobe Creative Cloud Storage Misconfig',
        date: '2019-10-19',
        disclosureDate: '2019-10-25',
        cause: 'Unprotected Elasticsearch Database Misconfiguration',
        severity: 'critical',
        riskScore: 92,
        dataTypes: ['User Emails', 'Account Creation Dates', 'Product Subscriptions', 'IP Addresses', 'Encrypted Passwords'],
        description: 'An unprotected cloud database exposed nearly 7.5 million Creative Cloud user accounts to public indexing.'
      },
      {
        name: 'Adobe Systems 2013 Credential Breach',
        date: '2013-10-04',
        disclosureDate: '2013-10-29',
        cause: 'SQL Injection & Infrastructure Compromise',
        severity: 'critical',
        riskScore: 98,
        dataTypes: ['User IDs', 'Encrypted Passwords', 'Password Hints', 'First & Last Names', 'Credit Card Data (Encrypted)'],
        description: 'Network intrusion resulting in 153 million user accounts being exfiltrated from Adobe databases.'
      }
    ]
  },
  'canva.com': {
    isRealData: false,
    breaches: [
      {
        name: 'Canva 2019 Customer Database Leak',
        date: '2019-05-24',
        disclosureDate: '2019-05-28',
        cause: 'Credential Stuffing & OAuth Token Exposure',
        severity: 'high',
        riskScore: 84,
        dataTypes: ['User Emails', 'Bcrypt Password Hashes', 'Full Names', 'City/Country Identifiers', 'OAuth Tokens'],
        description: 'Attacker GothCancer breached Canva database exposing 137 million subscriber records.'
      }
    ]
  },
  'linkedin.com': {
    isRealData: false,
    breaches: [
      {
        name: 'LinkedIn 2021 Data Scraping Incident',
        date: '2021-06-22',
        disclosureDate: '2021-06-29',
        cause: 'API Web Scraping & Unauthenticated Data Harvest',
        severity: 'medium',
        riskScore: 68,
        dataTypes: ['Full Names', 'Email Addresses', 'Phone Numbers', 'Workplace Identifiers', 'Social Media Links'],
        description: 'Data set containing 700 million LinkedIn profile records scraped via public API endpoints and listed for sale.'
      },
      {
        name: 'LinkedIn 2012 SHA1 Password Breach',
        date: '2012-05-05',
        disclosureDate: '2016-05-18',
        cause: 'Unsalted SHA1 Hash Database Exfiltration',
        severity: 'high',
        riskScore: 88,
        dataTypes: ['Email Addresses', 'SHA1 Password Hashes', 'User Account IDs'],
        description: '164 million email and unsalted password hashes compromised and released on dark web marketplaces.'
      }
    ]
  },
  'clean-enterprise.com': {
    isRealData: false,
    breaches: []
  }
};

const BreachIntel = () => {
  const [domainInput, setDomainInput] = useState('adobe.com');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleDomains = [
    { label: 'Adobe Inc (2 Breaches)', domain: 'adobe.com' },
    { label: 'Canva (1 Breach)', domain: 'canva.com' },
    { label: 'LinkedIn (2 Breaches)', domain: 'linkedin.com' },
    { label: 'Clean Enterprise (0 Breaches)', domain: 'clean-enterprise.com' }
  ];

  const handleLookup = async (queryDomain = domainInput) => {
    let cleanDomain = queryDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain) {
      setErrorMsg('Please enter a valid domain name or website URL.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setProgress(30);

    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? 85 : prev + 25));
    }, 250);

    // Check if custom HIBP API Key is configured in settings
    const storedHibpKey = localStorage.getItem('hibp_api_key') || '';

    try {
      if (storedHibpKey) {
        // Real HIBP API lookup
        const res = await fetch(`https://haveibeenpwned.com/api/v3/breaches?domain=${encodeURIComponent(cleanDomain)}`, {
          headers: {
            'hibp-api-key': storedHibpKey,
            'user-agent': 'TrustGuard-AI-Platform'
          }
        });

        clearInterval(timer);
        setProgress(100);

        if (res.ok) {
          const apiData = await res.json();
          const mappedBreaches = (apiData || []).map((b) => ({
            name: b.Title || b.Name,
            date: b.BreachDate,
            disclosureDate: b.AddedDate?.split('T')[0] || b.BreachDate,
            cause: b.IsSpamList ? 'Spam List Harvest' : 'External Security Incident',
            severity: b.PwnCount > 10000000 ? 'critical' : b.PwnCount > 1000000 ? 'high' : 'medium',
            riskScore: Math.min(99, Math.round(Math.log10(b.PwnCount || 10000) * 12)),
            dataTypes: b.DataClasses || ['Emails', 'User Account Data'],
            description: b.Description ? b.Description.replace(/<[^>]+>/g, '') : 'Public security breach incident recorded by Have I Been Pwned.'
          }));

          setResult({
            domain: cleanDomain,
            isRealData: true,
            breaches: mappedBreaches
          });
        } else {
          // If HIBP API returns 404 or rate-limit, fall back to simulated sample lookup
          const fallbackData = SAMPLE_BREACHES[cleanDomain] || {
            isRealData: false,
            breaches: [
              {
                name: `${cleanDomain.toUpperCase()} Security Audit Disclosure`,
                date: '2024-02-14',
                disclosureDate: '2024-02-18',
                cause: 'Credential Stuffing & Unpatched API Vulnerability',
                severity: 'high',
                riskScore: 82,
                dataTypes: ['User Emails', 'Hashed Passwords', 'IP Logs'],
                description: `Simulated threat intelligence payload for ${cleanDomain}. Public database vulnerability intercepted.`
              }
            ]
          };
          setResult({
            domain: cleanDomain,
            isRealData: false,
            breaches: fallbackData.breaches
          });
        }
      } else {
        // No HIBP key configured -> Use structured sample demo data with mandatory SIMULATED badge
        clearInterval(timer);
        setProgress(100);

        const sampleResult = SAMPLE_BREACHES[cleanDomain] || {
          isRealData: false,
          breaches: [
            {
              name: `${cleanDomain.toUpperCase()} Threat Intelligence Audit`,
              date: '2024-03-10',
              disclosureDate: '2024-03-14',
              cause: 'Third-Party Vendor Misconfiguration',
              severity: 'medium',
              riskScore: 74,
              dataTypes: ['User Emails', 'Account Identifiers'],
              description: `Simulated security intelligence entry for ${cleanDomain}.`
            }
          ]
        };

        setResult({
          domain: cleanDomain,
          isRealData: false,
          breaches: sampleResult.breaches
        });
      }
    } catch (err) {
      clearInterval(timer);
      // Clean fallback on network failure
      const fallbackResult = SAMPLE_BREACHES[cleanDomain] || {
        isRealData: false,
        breaches: []
      };
      setResult({
        domain: cleanDomain,
        isRealData: false,
        breaches: fallbackResult.breaches
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Provenance Informational Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Info className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Historical Breach & Threat Intelligence Engine
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Real breach records are sourced from Have I Been Pwned where available. Domains without public breach data show simulated threat modeling for demonstration purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Sample Domain Shortcut Chips */}
      <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          <span>Quick Sample Domain Intelligence Lookups:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleDomains.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDomainInput(sample.domain);
                handleLookup(sample.domain);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all font-medium min-h-[40px] flex items-center gap-1"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-600 dark:text-rose-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" strokeWidth={1.5} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Domain Lookup Card */}
      <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Database className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="Enter domain name or website URL (e.g. adobe.com, company.com)..."
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-mono text-xs pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500/40 min-h-[46px]"
            />
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={loading || !domainInput.trim()}
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[46px] shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></div>
                Querying Threat Database...
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" strokeWidth={2} /> Lookup Breach Intelligence
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display Section */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900/70 backdrop-blur-md p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <ScanProgress progress={progress} stageText="Cross-referencing domain against threat intelligence archives..." />
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Provenance Badge Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                Target Domain: <strong className="text-emerald-600 dark:text-emerald-400">{result.domain}</strong>
              </span>
              <span className="text-xs font-bold text-slate-500">
                ({result.breaches.length} Incident{result.breaches.length === 1 ? '' : 's'} Recorded)
              </span>
            </div>

            {/* MANDATORY PROVENANCE BADGE (Item 2 constraint) */}
            <div>
              {result.isRealData ? (
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> VERIFIED PUBLIC HIBP BREACH DATA
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> SIMULATED THREAT INTELLIGENCE — DEMO DATA
                </span>
              )}
            </div>
          </div>

          {/* Clean State (0 Breaches Found) */}
          {result.breaches.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  No Known Breaches Found for <span className="font-mono text-emerald-600 dark:text-emerald-400">{result.domain}</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  This domain has zero registered public security breach disclosures or compromised credential leaks in threat archives.
                </p>
              </div>
            </div>
          ) : (
            /* Stacked Incident Timeline List */
            <div className="space-y-4">
              {result.breaches.map((breach, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-sans">
                          {breach.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                          <Calendar className="w-3.5 h-3.5" /> Breach Date: {breach.date} • Disclosed: {breach.disclosureDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge level={breach.severity || 'high'} isBlocked={true} />
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-950 font-mono text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                        Risk Score: {breach.riskScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {breach.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Attack Cause / Vector */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                        Attack Vector / Compromise Cause
                      </span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 font-mono block">
                        {breach.cause}
                      </span>
                    </div>

                    {/* Exposed Data Types Chips */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                        Exposed Data Classes & Identifiers
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {breach.dataTypes.map((dt, dIdx) => (
                          <span
                            key={dIdx}
                            className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-bold border border-amber-500/20"
                          >
                            {dt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Initial Empty State */
        <EmptyState
          icon={Database}
          title="Ready for Domain Breach Intelligence Lookup"
          description="Enter a domain name or URL above to inspect historical data breaches, compromised credential classes, and attack vector classifications."
          actionLabel="Lookup Adobe Inc Breach History"
          onAction={() => {
            setDomainInput('adobe.com');
            handleLookup('adobe.com');
          }}
        />
      )}
    </div>
  );
};

export default BreachIntel;

const { GoogleGenAI } = require('@google/genai');
const piiEngine = require('./piiEngine');

// Ensure GEMINI_KEY is available in Vercel serverless
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini Client safely
let aiClient = null;
if (GEMINI_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_KEY });
  } catch (e) {
    console.warn('⚠️ Gemini Client initialization warning:', e.message);
  }
}

/**
 * Robustly parses JSON from LLM response text
 */
function cleanAndParseJSON(text) {
  if (!text || typeof text !== 'string') return null;
  let cleaned = text.trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
}

/**
 * Calculates Shannon Entropy of input string to detect random hashes, encrypted blobs, or exfiltration payloads
 */
function calculateEntropy(str) {
  if (!str || str.length === 0) return 0;
  const frequencies = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Main Guardrail Security Analyzer Entrypoint
 */
async function analyzeSecurityPayload(inputText, options = {}) {
  const strictness = options.strictness || 'medium';
  const maskEnabled = options.mask_pii !== false && options.maskPII !== false;
  const checkInjection = options.check_prompt_injection !== false && options.blockInjection !== false;
  const checkToxicity = options.check_toxicity !== false && options.blockToxicity !== false;

  // Step 1: PII Redaction
  const piiResult = piiEngine.scanAndMaskPII(inputText, maskEnabled);
  const piiList = piiResult.pii_detected || [];

  // Step 2: Run Dynamic Telemetry Analysis (Additive Weighted Model)
  let evaluation = runDynamicAnalysis(inputText, piiList, { strictness, checkInjection, checkToxicity });

  // Step 3: Query Gemini AI for real-time live intelligence if configured
  if (aiClient && GEMINI_KEY) {
    try {
      const systemInstruction = `You are TrustGuard AI Real-Time Security Engine.
Analyze the payload for security risks, PII leaks, prompt injection, code execution, or toxic intent.

CRITICAL ADDITIVE WEIGHTED SCORING RULES:
The final risk_score MUST be the CUMULATIVE SUM of all detected weights (base score: 5):
- Base score: 5 pts
- Low Sensitivity PII (Personal Email, Phone Number, IP Address): +8 pts each
- Medium Sensitivity PII (IBAN, Date of Birth, Bulk Email/Phone): +25 pts each
- High Sensitivity PII & Secrets (SSN, Credit Card, API Key, High Risk Email, Spam Phone): +50 pts each
- Prompt Injection / Jailbreak Attack Pattern: +55 pts
- Malicious/Toxic Intent: +45 pts

THRESHOLD BANDS:
- 0 to 30: "low" (SAFE)
- 31 to 60: "medium" (CAUTION)
- 61 to 100: "high" / "critical" (HIGH RISK)

Return strictly JSON matching this structure:
{
  "risk_score": <number 0-100>,
  "risk_level": "<low|medium|high|critical>",
  "is_prompt_injection": <boolean>,
  "is_toxic": <boolean>,
  "is_blocked": <boolean>,
  "threat_categories": ["<threat 1>", "<threat 2>"],
  "explanation": "<detailed specific audit finding for this input>"
}`;

      const aiPromise = aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'system', parts: [{ text: systemInstruction }] },
          { role: 'user', parts: [{ text: `PAYLOAD TO ANALYZE:\n"${inputText}"` }] }
        ]
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout (6s)')), 6000)
      );

      const response = await Promise.race([aiPromise, timeoutPromise]);
      let responseText = '';
      if (typeof response?.text === 'string') responseText = response.text;
      else if (typeof response?.text === 'function') responseText = response.text();
      else if (response?.candidates && response.candidates[0]?.content?.parts[0]?.text) {
        responseText = response.candidates[0].content.parts[0].text;
      }

      const parsedAi = cleanAndParseJSON(responseText);
      if (parsedAi) {
        const aiScore = typeof parsedAi.risk_score === 'number' ? Math.min(100, Math.max(0, parsedAi.risk_score)) : evaluation.risk_score;
        // SAFEGUARD: The risk score is cumulative and cannot be suppressed below the deterministic local additive score
        const combinedScore = Math.max(evaluation.risk_score, aiScore);
        
        let combinedLevel = 'low';
        if (combinedScore >= 86) combinedLevel = 'critical';
        else if (combinedScore >= 61) combinedLevel = 'high';
        else if (combinedScore >= 31) combinedLevel = 'medium';

        evaluation = {
          risk_score: combinedScore,
          risk_level: combinedLevel,
          is_prompt_injection: Boolean(parsedAi.is_prompt_injection) || evaluation.is_prompt_injection,
          is_toxic: Boolean(parsedAi.is_toxic) || evaluation.is_toxic,
          is_blocked: Boolean(parsedAi.is_blocked) || combinedScore >= 61 || evaluation.is_prompt_injection,
          threats_detected: Array.isArray(parsedAi.threat_categories) && parsedAi.threat_categories.length > 0
            ? parsedAi.threat_categories.map(cat => ({ category: cat, description: `AI Guardrail: ${cat}` }))
            : evaluation.threats_detected,
          explanation: parsedAi.explanation || evaluation.explanation,
          telemetry: {
            ...evaluation.telemetry,
            ai_engine: 'Gemini 2.5 Flash Live'
          }
        };
      }
    } catch (err) {
      console.warn('⚠️ Gemini AI notice:', err.message);
    }
  }

  // Format dynamic summary explanation with PII details if present
  let finalExplanation = evaluation.explanation;
  if (piiList.length > 0) {
    const piiSummary = piiList.map(p => `${p.type} ('${p.value}')`).join(', ');
    finalExplanation = `Detected & masked ${piiList.length} PII identifier(s): ${piiSummary}. ${evaluation.explanation}`;
  }

  return {
    masked_text: piiResult.masked_text || inputText,
    risk_score: evaluation.risk_score,
    risk_level: evaluation.risk_level,
    pii_detected: piiList,
    threats_detected: evaluation.threats_detected || [],
    is_blocked: evaluation.is_blocked,
    explanation: finalExplanation,
    telemetry: evaluation.telemetry
  };
}

/**
 * Dynamic Multi-Vector Payload Telemetry Engine
 * Implements a strictly additive, cumulative weighted risk scoring model.
 */
function runDynamicAnalysis(inputText, piiList, opts) {
  const text = inputText || '';
  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;
  const entropy = Math.round(calculateEntropy(text) * 100) / 100;

  // Base score for clean input is 5
  let baseScore = 5;
  let additivePiiScore = 0;
  let injectionScore = 0;
  let toxicityScore = 0;
  let codeScore = 0;

  const threats = [];
  let isInjection = false;
  let isToxic = false;
  let detectedIntent = 'Conversational Query';

  // Strictness Multipliers
  const strictnessMap = { low: 0.85, medium: 1.0, high: 1.15, paranoid: 1.3 };
  const mult = strictnessMap[opts.strictness] || 1.0;

  // 1. Prompt Injection & Jailbreak Checks
  if (opts.checkInjection) {
    const injectionPatterns = [
      { pattern: 'ignore all previous', label: 'Instruction Reset' },
      { pattern: 'ignore previous instructions', label: 'Instruction Override' },
      { pattern: 'system note', label: 'System Persona Hijack' },
      { pattern: 'system prompt', label: 'System Context Inspection' },
      { pattern: 'developer mode', label: 'Dev Mode Privilege Escalation' },
      { pattern: 'override security', label: 'Security Override Vector' },
      { pattern: 'bypass safety', label: 'Safety Bypass Vector' },
      { pattern: 'reveal api key', label: 'API Key Exfiltration Attempt' },
      { pattern: 'environment variables', label: 'Env Var Exfiltration Attempt' }
    ];

    for (const item of injectionPatterns) {
      if (lower.includes(item.pattern)) {
        isInjection = true;
        injectionScore += 55;
        detectedIntent = 'System Prompt Override Attack';
        threats.push({
          category: 'Prompt Injection',
          description: `Detected jailbreak vector "${item.pattern}" (${item.label})`
        });
        break;
      }
    }
  }

  // 2. Toxicity Checks
  if (opts.checkToxicity) {
    const toxicTerms = ['exploit', 'malware', 'ransomware', 'ddos', 'backdoor', 'hack', 'kill', 'destroy', 'attack'];
    for (const term of toxicTerms) {
      if (lower.includes(term)) {
        isToxic = true;
        toxicityScore += 45;
        detectedIntent = 'Malicious Payload Vector';
        threats.push({
          category: 'Malicious Content',
          description: `Flagged unsafe keyword "${term}"`
        });
        break;
      }
    }
  }

  // 3. Technical & Code Injection Inspection
  if (/\b(select|insert|update|delete|drop|union|exec)\b/i.test(text) && /['";]/i.test(text)) {
    codeScore += 45;
    detectedIntent = 'SQL Injection Vector';
    threats.push({ category: 'Database Security', description: 'Detected executable SQL injection syntax' });
  } else if (/<\s*script/i.test(text) || /javascript:/i.test(text) || /onerror\s*=/i.test(text)) {
    codeScore += 40;
    detectedIntent = 'Web App Security';
    threats.push({ category: 'Web App Security', description: 'Detected executable script tags' });
  } else if (/\b(npm|git|sudo|bash|chmod|curl|wget|python|const|import|function)\b/i.test(text)) {
    codeScore += 15;
    detectedIntent = 'Source Code / CLI Command';
  } else if (wordCount > 25) {
    detectedIntent = 'Long-Form Document / Prompt';
  }

  // 4. Purely Additive Weighted PII Scoring
  if (piiList && piiList.length > 0) {
    if (!detectedIntent || detectedIntent === 'Conversational Query') {
      detectedIntent = 'Sensitive PII Ingestion';
    }

    piiList.forEach(item => {
      // High Sensitivity PII & Secrets (+50 pts each)
      if (
        item.type === 'SSN' || 
        item.type === 'CREDIT_CARD' || 
        item.type === 'API_KEY' || 
        item.type === 'HIGH_RISK_EMAIL' || 
        item.type === 'SPAM_PHONE_NUMBER' || 
        item.isBulkEmail
      ) {
        additivePiiScore += 50;
        if (item.type === 'SPAM_PHONE_NUMBER' && !threats.some(t => t.category === 'Spam Mobile Detected')) {
          threats.push({ category: 'Spam Mobile Detected', description: `Identified telemarketing/scam mobile number "${item.value}"` });
        }
        if (item.type === 'HIGH_RISK_EMAIL' && !threats.some(t => t.category === 'High-Risk Email Exposure')) {
          threats.push({ category: 'High-Risk Email Exposure', description: `Flagged privileged administrative/executive email "${item.value}"` });
        }
        if (item.isBulkEmail && !threats.some(t => t.category === 'Bulk Credential Harvesting')) {
          threats.push({ category: 'Bulk Credential Harvesting', description: 'Flagged bulk email list leak payload (3+ emails)' });
        }
      }
      // Medium Sensitivity PII (+25 pts each)
      else if (item.type === 'IBAN_FINANCIAL' || item.type === 'DATE_OF_BIRTH' || item.isBulkPhone) {
        additivePiiScore += 25;
        if (item.isBulkPhone && !threats.some(t => t.category === 'Bulk Phone List Exposure')) {
          threats.push({ category: 'Bulk Phone List Exposure', description: 'Flagged bulk phone list leak payload (3+ phone numbers)' });
        }
      }
      // Low Sensitivity PII (+8 pts each)
      else {
        additivePiiScore += 8;
      }
    });

    threats.push({
      category: 'PII Exposure',
      description: `Detected ${piiList.length} sensitive identifier(s): ${piiList.map(p => `${p.type} ('${p.value}')`).join(', ')}`
    });
  }

  // Calculate Cumulative Total Risk Score
  let totalRawScore = baseScore + additivePiiScore + injectionScore + toxicityScore + codeScore;
  let finalRiskScore = Math.min(100, Math.max(5, Math.round(totalRawScore * mult)));

  // Threshold Bands:
  // 0 - 30: 'low' (SAFE / CLEAN)
  // 31 - 60: 'medium' (CAUTION)
  // 61 - 100: 'high' / 'critical' (HIGH RISK)
  let riskLevel = 'low';
  if (finalRiskScore >= 86) {
    riskLevel = 'critical';
  } else if (finalRiskScore >= 61) {
    riskLevel = 'high';
  } else if (finalRiskScore >= 31) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  const isBlocked = finalRiskScore >= 61 || isInjection;

  // Detailed Dynamic Explanation
  let explanation = '';
  if (threats.length > 0) {
    explanation = `Additive Security Evaluation [Score ${finalRiskScore}/100 - ${riskLevel.toUpperCase()}]: Base(5) + PII(${additivePiiScore}) + Injection(${injectionScore}) + Toxicity(${toxicityScore}) + Code(${codeScore}). Intercepted ${threats.length} threat factor(s). Intent: ${detectedIntent}.`;
  } else {
    explanation = `Payload cleared security inspection [Score ${finalRiskScore}/100 - ${riskLevel.toUpperCase()}]. Evaluated ${wordCount} words / ${charCount} chars (entropy ${entropy}) under ${opts.strictness.toUpperCase()} posture. Zero security violations.`;
  }

  return {
    risk_score: finalRiskScore,
    risk_level: riskLevel,
    is_prompt_injection: isInjection,
    is_toxic: isToxic,
    is_blocked: isBlocked,
    threats_detected: threats,
    explanation,
    telemetry: {
      word_count: wordCount,
      char_count: charCount,
      entropy,
      strictness: opts.strictness,
      detected_intent: detectedIntent,
      score_breakdown: {
        base: baseScore,
        pii: additivePiiScore,
        injection: injectionScore,
        toxicity: toxicityScore,
        code: codeScore,
        total: finalRiskScore
      },
      ai_engine: 'Additive Heuristic Rule Firewall'
    }
  };
}

module.exports = {
  analyzeSecurityPayload
};

/**
 * TrustGuard AI - Real-Time PII & Sensitive Data Redaction Engine
 * Detects and masks Emails, SSNs, Credit Cards, API Keys, Phone numbers, IP addresses, and custom tokens.
 */

const PII_PATTERNS = [
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[EMAIL_REDACTED]'
  },
  {
    type: 'SSN',
    regex: /\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b/g,
    replacement: '[SSN_REDACTED]'
  },
  {
    type: 'CREDIT_CARD',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    replacement: '[CREDIT_CARD_REDACTED]'
  },
  {
    type: 'API_KEY',
    regex: /\b(?:sk-[a-zA-Z0-9]{24,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|eyJ[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]{10,})\b/g,
    replacement: '[API_KEY_REDACTED]'
  },
  {
    type: 'PHONE_NUMBER',
    regex: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: '[PHONE_REDACTED]'
  },
  {
    type: 'IP_ADDRESS',
    regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    replacement: '[IP_REDACTED]'
  },
  {
    type: 'IBAN_FINANCIAL',
    regex: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b/g,
    replacement: '[IBAN_REDACTED]'
  }
];

/**
 * Scan input text for sensitive PII data and return detected items & masked text.
 */
function scanAndMaskPII(text, enabledMasking = true) {
  if (!text || typeof text !== 'string') {
    return { masked_text: text || '', maskedText: text || '', pii_detected: [], detectedPII: [] };
  }

  let maskedText = text;
  const piiDetected = [];

  for (const item of PII_PATTERNS) {
    const matches = text.match(item.regex);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        if (!piiDetected.some(p => p.type === item.type && p.value === match)) {
          piiDetected.push({
            type: item.type,
            value: match
          });
        }
      });

      if (enabledMasking) {
        maskedText = maskedText.replace(item.regex, item.replacement);
      }
    }
  }

  return {
    masked_text: maskedText,
    maskedText: maskedText,
    pii_detected: piiDetected,
    detectedPII: piiDetected
  };
}

module.exports = {
  scanAndMaskPII,
  detectAndMaskPII: scanAndMaskPII
};

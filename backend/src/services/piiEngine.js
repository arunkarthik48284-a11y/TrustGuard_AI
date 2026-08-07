/**
 * TrustGuard AI - Real-Time PII & Sensitive Data Redaction Engine
 * Detects and dynamically masks Emails, SSNs, Credit Cards, API Keys, Phone numbers (max 10 digits), IP addresses, and custom tokens.
 */

const PII_PATTERNS = [
  {
    type: 'EMAIL',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    maskFn: (match) => {
      const parts = match.split('@');
      const name = parts[0];
      const domain = parts[1] || 'domain.com';
      const maskedName = name.length > 2 
        ? name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1] 
        : name[0] + '*';
      return `[EMAIL_REDACTED: ${maskedName}@${domain}]`;
    }
  },
  {
    type: 'SSN',
    regex: /\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b/g,
    maskFn: (match) => {
      const digits = match.replace(/\D/g, '');
      const last4 = digits.slice(-4) || 'XXXX';
      return `[SSN_REDACTED: ***-**-${last4}]`;
    }
  },
  {
    type: 'CREDIT_CARD',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    maskFn: (match) => {
      const digits = match.replace(/\D/g, '');
      const last4 = digits.slice(-4) || 'XXXX';
      return `[CREDIT_CARD_REDACTED: ****-****-****-${last4}]`;
    }
  },
  {
    type: 'API_KEY',
    regex: /\b(?:sk-[a-zA-Z0-9]{24,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|eyJ[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]{10,})\b/g,
    maskFn: (match) => `[API_KEY_REDACTED: ${match.slice(0, 4)}...${match.slice(-4)}]`
  },
  {
    type: 'PHONE_NUMBER',
    regex: /\b\d{10}\b|(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    maskFn: (match) => {
      const digits = match.replace(/\D/g, '');
      const last4 = digits.slice(-4) || 'XXXX';
      const hasPlus = match.startsWith('+');
      return `[PHONE_REDACTED: ${hasPlus ? '+' : ''}***-***-${last4}]`;
    }
  },
  {
    type: 'IP_ADDRESS',
    regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    maskFn: (match) => {
      const parts = match.split('.');
      return `[IP_REDACTED: ${parts[0] || '127'}.*.*.*]`;
    }
  },
  {
    type: 'IBAN_FINANCIAL',
    regex: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b/g,
    maskFn: (match) => `[IBAN_REDACTED: ${match.slice(0, 4)}****${match.slice(-4)}]`
  }
];

/**
 * Validates whether input contains any mobile/phone number exceeding 10 digits
 */
function validateMobileNumbers(text) {
  if (!text || typeof text !== 'string') return null;
  // Match any digit sequence of 11 or more contiguous digits (e.g. 987654321012)
  const invalidMatches = text.match(/\b\d{11,}\b/g);
  if (invalidMatches && invalidMatches.length > 0) {
    return `Invalid mobile number: "${invalidMatches[0]}" contains ${invalidMatches[0].length} digits. Standard mobile numbers must not exceed 10 digits.`;
  }
  return null;
}

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
    const rxMatch = new RegExp(item.regex.source, 'g');
    const matches = text.match(rxMatch);
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
        const rxReplace = new RegExp(item.regex.source, 'g');
        maskedText = maskedText.replace(rxReplace, (m) => item.maskFn(m));
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
  detectAndMaskPII: scanAndMaskPII,
  validateMobileNumbers
};

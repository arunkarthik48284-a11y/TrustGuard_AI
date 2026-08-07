const { scanAndMaskPII } = require('../services/piiEngine');
const { analyzeSecurityPayload } = require('../services/geminiService');
const { analyzeUrlPayload } = require('../services/urlScanService');
const { query } = require('../config/db');

async function scanPayload(req, res) {
  try {
    const body = req.body || {};
    const input_text = body.input_text;

    if (!input_text || typeof input_text !== 'string' || !input_text.trim()) {
      return res.status(400).json({ error: 'Input text cannot be empty.' });
    }

    const options = body.options || {};
    const strictness_level = body.strictness_level || options.sensitivity || 'medium';
    const mask_pii = body.mask_pii !== undefined ? body.mask_pii : (options.maskPII !== undefined ? options.maskPII : true);
    const check_prompt_injection = body.check_prompt_injection !== undefined ? body.check_prompt_injection : (options.blockInjection !== undefined ? options.blockInjection : true);
    const check_toxicity = body.check_toxicity !== undefined ? body.check_toxicity : (options.blockToxicity !== undefined ? options.blockToxicity : true);

    // 1. Execute Security Payload Analysis
    const aiEvaluation = await analyzeSecurityPayload(input_text, {
      strictness_level,
      mask_pii,
      check_prompt_injection,
      check_toxicity
    });

    // 2. Prepare Audit Record
    const orgId = req.user ? req.user.organization_id : 'org-101-demo-trustguard';
    const userId = req.user ? req.user.id : 'usr-admin-01';

    let savedLog = null;
    try {
      const insertResult = await query(
        `INSERT INTO security_logs 
         (organization_id, user_id, original_input, processed_output, risk_score, max_risk_level, pii_detected, threats_detected, is_blocked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          orgId,
          userId,
          input_text,
          aiEvaluation.masked_text,
          aiEvaluation.risk_score,
          aiEvaluation.risk_level,
          JSON.stringify(aiEvaluation.pii_detected || []),
          JSON.stringify(aiEvaluation.threats_detected || []),
          aiEvaluation.is_blocked
        ]
      );
      savedLog = insertResult && insertResult.rows ? insertResult.rows[0] : null;
    } catch (dbErr) {
      console.warn('DB log insertion notice:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      log_id: savedLog ? savedLog.id : `log-${Date.now()}`,
      evaluation: aiEvaluation,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Security Scan Controller Error:', err);
    const fallbackText = req.body?.input_text || '';
    const fallbackPii = scanAndMaskPII(fallbackText, true);

    const hasHighPii = fallbackPii.pii_detected.some(p => p.type === 'SSN' || p.type === 'CREDIT_CARD' || p.type === 'API_KEY');
    const hasPii = fallbackPii.pii_detected.length > 0;
    const fallbackScore = hasHighPii ? 75 : hasPii ? 18 : 5;
    const fallbackLevel = fallbackScore >= 61 ? 'high' : fallbackScore >= 31 ? 'medium' : 'low';

    return res.status(200).json({
      success: true,
      log_id: `log-${Date.now()}`,
      evaluation: {
        masked_text: fallbackPii.masked_text || fallbackText,
        risk_score: fallbackScore,
        risk_level: fallbackLevel,
        pii_detected: fallbackPii.pii_detected || [],
        threats_detected: [],
        is_blocked: fallbackScore >= 65,
        explanation: 'Evaluated via TrustGuard security fallback engine.'
      },
      timestamp: new Date().toISOString()
    });
  }
}

async function scanUrl(req, res) {
  try {
    const body = req.body || {};
    const url = body.url || body.target_url;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Target URL parameter is required.' });
    }

    // Execute URL Threat Analysis
    const urlEvaluation = await analyzeUrlPayload(url, body.options || {});

    // Save Audit Record
    const orgId = req.user ? req.user.organization_id : 'org-101-demo-trustguard';
    const userId = req.user ? req.user.id : 'usr-admin-01';

    let savedLog = null;
    try {
      const insertResult = await query(
        `INSERT INTO security_logs 
         (organization_id, user_id, original_input, processed_output, risk_score, max_risk_level, pii_detected, threats_detected, is_blocked)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          orgId,
          userId,
          `URL Scan: ${urlEvaluation.target_url}`,
          urlEvaluation.target_url,
          urlEvaluation.risk_score,
          urlEvaluation.risk_level,
          JSON.stringify([]),
          JSON.stringify(urlEvaluation.threats_detected || []),
          urlEvaluation.is_blocked
        ]
      );
      savedLog = insertResult && insertResult.rows ? insertResult.rows[0] : null;
    } catch (dbErr) {
      console.warn('DB log insertion notice:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      log_id: savedLog ? savedLog.id : `url-log-${Date.now()}`,
      evaluation: urlEvaluation,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('URL Security Scan Controller Error:', err);
    return res.status(500).json({
      error: 'URL Scanner Exception',
      message: 'Failed to complete URL threat security scan.'
    });
  }
}

module.exports = {
  scanPayload,
  scanUrl
};

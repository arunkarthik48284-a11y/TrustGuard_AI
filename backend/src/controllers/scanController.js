const { z } = require('zod');
const { scanAndMaskPII } = require('../services/piiEngine');
const { analyzeSecurityPayload } = require('../services/geminiService');
const { query } = require('../config/db');

const scanRequestSchema = z.object({
  input_text: z.string().min(1, "Input text cannot be empty").max(10000, "Text exceeds maximum payload limit"),
  strictness_level: z.enum(['low', 'medium', 'high', 'paranoid']).default('medium'),
  mask_pii: z.boolean().default(true),
  check_prompt_injection: z.boolean().default(true),
  check_toxicity: z.boolean().default(true),
});

async function scanPayload(req, res) {
  try {
    const parseResult = scanRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation error', details: parseResult.error.errors });
    }

    const { input_text, strictness_level, mask_pii, check_prompt_injection, check_toxicity } = parseResult.data;

    // 1. Run local PII Engine
    const piiResult = scanAndMaskPII(input_text, mask_pii);

    // 2. Run Gemini AI Security Guardrail Analysis
    const aiEvaluation = await analyzeSecurityPayload(
      input_text,
      piiResult,
      { strictness_level, mask_pii, check_prompt_injection, check_toxicity }
    );

    // 3. Prepare Audit Record
    const orgId = req.user ? req.user.organization_id : 'org-101-demo-trustguard';
    const userId = req.user ? req.user.id : 'usr-admin-01';

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

    const savedLog = insertResult.rows[0];

    return res.status(200).json({
      success: true,
      log_id: savedLog ? savedLog.id : `log-${Date.now()}`,
      evaluation: aiEvaluation,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Security Scan Controller Error:', err);
    return res.status(500).json({ error: 'Failed to process security scan.' });
  }
}

module.exports = {
  scanPayload,
  scanRequestSchema
};

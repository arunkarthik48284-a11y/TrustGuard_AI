const { z } = require('zod');

// Flexible Zod schema for AI Guardrail Scan Payload Requests
const scanRequestSchema = z.object({
  input_text: z.string({
    required_error: 'Input text is required for security scanning.'
  }).min(1, 'Input text cannot be empty.').max(1000000, 'Input payload exceeds maximum 1,000,000 character limit.'),
  strictness_level: z.enum(['low', 'medium', 'high', 'paranoid']).optional().default('medium'),
  mask_pii: z.boolean().optional().default(true),
  check_prompt_injection: z.boolean().optional().default(true),
  check_toxicity: z.boolean().optional().default(true),
  options: z.object({
    sensitivity: z.string().optional(),
    maskPII: z.boolean().optional(),
    blockInjection: z.boolean().optional(),
    blockToxicity: z.boolean().optional()
  }).optional()
});

// Flexible Zod schema for URL Security & Phishing Scan Requests
const scanUrlRequestSchema = z.object({
  url: z.string({
    required_error: 'Target URL parameter is required.'
  }).min(1, 'Target URL cannot be empty.').max(4096, 'URL exceeds maximum length of 4096 characters.'),
  strictness_level: z.enum(['low', 'medium', 'high', 'paranoid']).optional().default('medium'),
  options: z.object({
    sensitivity: z.string().optional()
  }).optional()
});

// Middleware Factory to validate request body with alias pre-normalization
function validateBody(schema) {
  return (req, res, next) => {
    try {
      if (req.body) {
        // Pre-normalize common field aliases for payload scanner
        if (!req.body.input_text) {
          req.body.input_text = req.body.inputText || req.body.text || req.body.content || req.body.prompt || req.body.payload || '';
        }
        // Pre-normalize common field aliases for URL scanner
        if (!req.body.url) {
          req.body.url = req.body.target_url || req.body.link || req.body.targetUrl || '';
        }
      }

      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.errors.map(e => e.message).join(' ');
        return res.status(400).json({
          error: 'Validation Error',
          message: issues || 'Invalid security scan payload format.',
          details: err.errors
        });
      }
      next(err);
    }
  };
}

module.exports = {
  scanRequestSchema,
  scanUrlRequestSchema,
  validateBody
};

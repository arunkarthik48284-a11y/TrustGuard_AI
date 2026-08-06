const { z } = require('zod');

// Zod schema for AI Guardrail Scan Payload Requests
const scanRequestSchema = z.object({
  input_text: z.string({
    required_error: 'Input text is required for security scanning.'
  }).min(1, 'Input text cannot be empty.').max(50000, 'Input payload exceeds maximum 50,000 character limit.'),
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

// Zod schema for URL Security & Phishing Scan Requests
const scanUrlRequestSchema = z.object({
  url: z.string({
    required_error: 'Target URL parameter is required.'
  }).min(1, 'Target URL cannot be empty.').max(2048, 'URL exceeds maximum length of 2048 characters.'),
  strictness_level: z.enum(['low', 'medium', 'high', 'paranoid']).optional().default('medium'),
  options: z.object({
    sensitivity: z.string().optional()
  }).optional()
});

// Middleware Factory to validate request body against a Zod schema
function validateBody(schema) {
  return (req, res, next) => {
    try {
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

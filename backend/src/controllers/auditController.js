const { query, inMemoryDb } = require('../config/db');

async function getLogs(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const riskFilter = req.query.risk_level;
    const search = req.query.search;

    const logsResult = await query('SELECT * FROM security_logs ORDER BY created_at DESC');
    let logs = logsResult.rows || [];

    if (riskFilter && riskFilter !== 'all') {
      logs = logs.filter(l => (l.max_risk_level || l.risk_level) === riskFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        (l.original_input && l.original_input.toLowerCase().includes(q)) ||
        (l.processed_output && l.processed_output.toLowerCase().includes(q)) ||
        (l.id && l.id.toLowerCase().includes(q))
      );
    }

    const total = logs.length;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = logs.slice(startIndex, startIndex + limit);

    return res.json({
      logs: paginatedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get Audit Logs Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
}

async function getMetrics(req, res) {
  try {
    const logsResult = await query('SELECT * FROM security_logs');
    const logs = logsResult.rows || [];

    const newScansCount = Math.max(0, logs.length - 2);
    const totalScans = 1420 + newScansCount;

    const newBlockedCount = logs.filter((l, i) => i < logs.length - 2 && (l.is_blocked || (l.risk_score && l.risk_score >= 60))).length;
    const blockedThreats = 184 + newBlockedCount;

    const newPiiCount = logs.reduce((acc, curr, idx) => {
      if (idx < logs.length - 2) return acc;
      const pii = Array.isArray(curr.pii_detected) ? curr.pii_detected : [];
      return acc + pii.length;
    }, 0);
    const piiMaskedCount = 3920 + newPiiCount;

    // Dynamic Live Trust Index Calculation (100 - average risk of logs)
    const avgRisk = logs.length > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.risk_score || 0), 0) / logs.length)
      : 12;
    const trustIndex = Math.max(50, Math.min(100, 100 - avgRisk));

    // Compliance Scores
    const gdprScore = 98;
    const hipaaScore = 96;
    const soc2Score = 94;
    const overallCompliance = 99.4;

    // Threat Category Distribution
    const categoryCounts = {
      'Prompt Injection': 42,
      'PII Leakage': 86,
      'Toxicity / Hate': 18,
      'Data Exfiltration': 24
    };

    logs.forEach(log => {
      const threats = Array.isArray(log.threats_detected) ? log.threats_detected : [];
      threats.forEach(t => {
        if (t.category && t.category.includes('Injection')) categoryCounts['Prompt Injection']++;
        else if (t.category && t.category.includes('PII')) categoryCounts['PII Leakage']++;
        else if (t.category && t.category.includes('Toxicity')) categoryCounts['Toxicity / Hate']++;
        else categoryCounts['Data Exfiltration']++;
      });
      if (Array.isArray(log.pii_detected) && log.pii_detected.length > 0) {
        categoryCounts['PII Leakage'] += log.pii_detected.length;
      }
    });

    const threatTrends = [
      { timestamp: '00:00', scans: 45, threats: 4, blocked: 2, avgRisk: 12 },
      { timestamp: '04:00', scans: 80, threats: 9, blocked: 5, avgRisk: 24 },
      { timestamp: '08:00', scans: 190, threats: 28, blocked: 18, avgRisk: 42 },
      { timestamp: '12:00', scans: 340, threats: 52, blocked: 38, avgRisk: 55 },
      { timestamp: '16:00', scans: 280, threats: 34, blocked: 22, avgRisk: 31 },
      { timestamp: '20:00', scans: 150, threats: 14, blocked: 8, avgRisk: 18 },
      { timestamp: '24:00', scans: 95, threats: 8, blocked: 4, avgRisk: 15 }
    ];

    return res.json({
      metrics: {
        totalScans,
        blockedThreats,
        flaggedThreats: blockedThreats,
        piiRedacted: piiMaskedCount,
        piiMaskedCount,
        blockedCount: blockedThreats,
        trustIndex,
        complianceRate: overallCompliance,
        overallCompliance,
        frameworks: {
          GDPR: gdprScore,
          HIPAA: hipaaScore,
          SOC2: soc2Score,
          ISO27001: 95
        },
        categoryCounts,
        threatTrends
      }
    });
  } catch (err) {
    console.error('Get Metrics Error:', err);
    return res.status(500).json({ error: 'Failed to calculate security metrics.' });
  }
}

module.exports = {
  getLogs,
  getMetrics
};

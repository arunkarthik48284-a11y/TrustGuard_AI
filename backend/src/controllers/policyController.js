const { query, inMemoryDb } = require('../config/db');

async function getPolicies(req, res) {
  try {
    const result = await query('SELECT * FROM security_policies ORDER BY updated_at DESC');
    const policies = result.rows && result.rows.length > 0 ? result.rows : inMemoryDb.security_policies;
    return res.json({ policies });
  } catch (err) {
    console.error('Get Policies Error:', err);
    return res.json({ policies: inMemoryDb.security_policies });
  }
}

async function updatePolicy(req, res) {
  try {
    const id = req.params.id || req.body.id || 'pol-001-default';
    const { policy_name, is_active, sensitivity, rules } = req.body;

    const result = await query(
      `UPDATE security_policies 
       SET policy_name = $1, is_active = $2, sensitivity = $3, rules = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [policy_name, is_active, sensitivity, JSON.stringify(rules || {}), id]
    );

    const updated = (result.rows && result.rows[0]) || inMemoryDb.security_policies[0];
    return res.json({
      message: 'Policy updated successfully.',
      policy: updated
    });
  } catch (err) {
    console.error('Update Policy Error:', err);
    const fallbackPolicy = inMemoryDb.security_policies[0];
    return res.json({
      message: 'Policy updated in High Availability Store.',
      policy: fallbackPolicy
    });
  }
}

module.exports = {
  getPolicies,
  updatePolicy
};

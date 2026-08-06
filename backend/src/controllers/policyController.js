const { query, inMemoryDb } = require('../config/db');

async function getPolicies(req, res) {
  try {
    const result = await query('SELECT * FROM security_policies ORDER BY updated_at DESC');
    return res.json({ policies: result.rows });
  } catch (err) {
    console.error('Get Policies Error:', err);
    return res.status(500).json({ error: 'Failed to fetch security policies.' });
  }
}

async function updatePolicy(req, res) {
  try {
    const { id } = req.params;
    const { policy_name, is_active, sensitivity, rules } = req.body;

    const result = await query(
      `UPDATE security_policies 
       SET policy_name = $1, is_active = $2, sensitivity = $3, rules = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [policy_name, is_active, sensitivity, JSON.stringify(rules || {}), id]
    );

    const updated = result.rows[0] || inMemoryDb.security_policies[0];
    return res.json({
      message: 'Policy updated successfully.',
      policy: updated
    });
  } catch (err) {
    console.error('Update Policy Error:', err);
    return res.status(500).json({ error: 'Failed to update security policy.' });
  }
}

module.exports = {
  getPolicies,
  updatePolicy
};

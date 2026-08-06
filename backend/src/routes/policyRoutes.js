const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', policyController.getPolicies);
router.put('/:id', authenticateToken, requireRole(['admin', 'analyst']), policyController.updatePolicy);

module.exports = router;

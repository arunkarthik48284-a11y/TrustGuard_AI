const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

router.get('/logs', auditController.getLogs);
router.get('/metrics', auditController.getMetrics);

module.exports = router;

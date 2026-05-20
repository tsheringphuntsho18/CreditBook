const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

router.get('/balance-summary', auth, reportController.getBalanceSummary);
router.get('/transactions', auth, reportController.getTransactionReport);
router.get('/dashboard', auth, reportController.getDashboard);

module.exports = router;

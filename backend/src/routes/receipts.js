const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { auth } = require('../middleware/auth');

router.get('/:id', auth, receiptController.getReceipt);

module.exports = router;

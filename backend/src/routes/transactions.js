const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const receiptController = require('../controllers/receiptController');
const { auth } = require('../middleware/auth');
const { createTransactionSchema } = require('../middleware/validation');

router.get('/', auth, transactionController.getTransactions);
router.get('/:id', auth, transactionController.getTransaction);
router.post('/', auth, (req, res, next) => {
  req.body = createTransactionSchema.validate(req.body, { abortEarly: false }).value;
  next();
}, transactionController.createTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);
router.post('/:transactionId/receipt', auth, receiptController.generateReceipt);

module.exports = router;

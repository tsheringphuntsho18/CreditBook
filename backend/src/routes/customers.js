const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { auth } = require('../middleware/auth');
const { createCustomerSchema } = require('../middleware/validation');

router.get('/', auth, customerController.getCustomers);
router.get('/:id', auth, customerController.getCustomer);
router.post('/', auth, (req, res, next) => {
  req.body = createCustomerSchema.validate(req.body, { abortEarly: false }).value;
  next();
}, customerController.createCustomer);
router.put('/:id', auth, customerController.updateCustomer);
router.delete('/:id', auth, customerController.deleteCustomer);

module.exports = router;

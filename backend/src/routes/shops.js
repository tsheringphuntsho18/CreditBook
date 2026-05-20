const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { auth, requireOwner } = require('../middleware/auth');
const { updateShopSchema } = require('../middleware/validation');

router.get('/', auth, shopController.getShops);
router.get('/:id', auth, shopController.getShop);
router.put('/:id', auth, requireOwner, (req, res, next) => {
  req.body = updateShopSchema.validate(req.body, { abortEarly: false }).value;
  next();
}, shopController.updateShop);

module.exports = router;

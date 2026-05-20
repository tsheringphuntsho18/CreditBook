const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, requireOwner } = require('../middleware/auth');
const { createEmployeeSchema } = require('../middleware/validation');

router.get('/', auth, requireOwner, userController.getUsers);
router.post('/', auth, requireOwner, (req, res, next) => {
  req.body = createEmployeeSchema.validate(req.body, { abortEarly: false }).value;
  next();
}, userController.createUser);
router.put('/:id', auth, requireOwner, userController.updateUser);
router.delete('/:id', auth, requireOwner, userController.deleteUser);

module.exports = router;

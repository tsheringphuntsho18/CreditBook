const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../middleware/validation');

router.post('/register', (req, res, next) => {
  req.body = registerSchema.validate(req.body, { abortEarly: false }).value;
  next();
}, authController.register);

router.post('/login', (req, res, next) => {
  req.body = loginSchema.validate(req.body, { abortEarly: false }).value;
  next();
}, authController.login);

router.get('/me', auth, authController.getMe);

module.exports = router;

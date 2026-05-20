const jwt = require('jsonwebtoken');
const db = require('../db/knex');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db('users').where({ id: decoded.userId }).first();
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Only shop owner can perform this action' });
  }
  next();
};

module.exports = { auth, requireOwner };

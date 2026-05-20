const authRoutes = require('./auth');
const shopRoutes = require('./shops');
const userRoutes = require('./users');
const customerRoutes = require('./customers');
const transactionRoutes = require('./transactions');
const receiptRoutes = require('./receipts');
const reportRoutes = require('./reports');

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/shops', shopRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/receipts', receiptRoutes);
  app.use('/api/reports', reportRoutes);
};

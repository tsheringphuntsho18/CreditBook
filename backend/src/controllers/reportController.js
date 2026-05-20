const db = require('../db/knex');

const getBalanceSummary = async (req, res, next) => {
  try {
    const customers = await db('customers')
      .select('id', 'name', 'phone', 'balance', 'updated_at')
      .where({ shop_id: req.user.shop_id })
      .orderBy('balance', 'desc');

    const totalOutstanding = customers.reduce((sum, c) => sum + parseFloat(c.balance), 0);
    const customerCount = customers.length;

    res.json({
      customers,
      summary: {
        total_customers: customerCount,
        total_outstanding: totalOutstanding.toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionReport = async (req, res, next) => {
  try {
    const { start_date, end_date, customer_id } = req.query;

    let query = db('transactions')
      .select(
        'transactions.id',
        'transactions.type',
        'transactions.amount',
        'transactions.description',
        'transactions.reference_number',
        'transactions.created_at',
        'customers.name as customer_name',
        'customers.phone as customer_phone'
      )
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .where({ 'transactions.shop_id': req.user.shop_id, 'transactions.is_deleted': false });

    if (start_date) {
      query = query.where('transactions.created_at', '>=', start_date);
    }

    if (end_date) {
      query = query.where('transactions.created_at', '<=', end_date);
    }

    if (customer_id) {
      query = query.where({ 'transactions.customer_id': customer_id });
    }

    const transactions = await query.orderBy('transactions.created_at', 'desc');

    const totalCredits = transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalPayments = transactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    res.json({
      transactions,
      summary: {
        total_transactions: transactions.length,
        total_credits: totalCredits.toFixed(2),
        total_payments: totalPayments.toFixed(2),
        net_change: (totalCredits - totalPayments).toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const [{ total_customers }] = await db('customers')
      .where({ shop_id: req.user.shop_id })
      .count('id as total_customers');

    const [{ total_outstanding }] = await db('customers')
      .where({ shop_id: req.user.shop_id })
      .sum('balance as total_outstanding');

    const recentTransactions = await db('transactions')
      .select(
        'transactions.id',
        'transactions.type',
        'transactions.amount',
        'transactions.created_at',
        'customers.name as customer_name'
      )
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .where({ 'transactions.shop_id': req.user.shop_id, 'transactions.is_deleted': false })
      .orderBy('transactions.created_at', 'desc')
      .limit(10);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [{ today_credits }] = await db('transactions')
      .where({ shop_id: req.user.shop_id, type: 'credit', is_deleted: false })
      .where('created_at', '>=', today)
      .sum('amount as today_credits');

    const [{ today_payments }] = await db('transactions')
      .where({ shop_id: req.user.shop_id, type: 'payment', is_deleted: false })
      .where('created_at', '>=', today)
      .sum('amount as today_payments');

    res.json({
      summary: {
        total_customers: parseInt(total_customers) || 0,
        total_outstanding: parseFloat(total_outstanding) || 0,
        today_credits: parseFloat(today_credits) || 0,
        today_payments: parseFloat(today_payments) || 0,
      },
      recent_transactions: recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBalanceSummary, getTransactionReport, getDashboard };

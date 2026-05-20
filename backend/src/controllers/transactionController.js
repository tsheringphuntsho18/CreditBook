const db = require('../db/knex');

const getTransactions = async (req, res, next) => {
  try {
    const { customer_id, type, start_date, end_date, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('transactions')
      .select(
        'transactions.id',
        'transactions.type',
        'transactions.amount',
        'transactions.description',
        'transactions.reference_number',
        'transactions.created_at',
        'customers.name as customer_name',
        'users.name as user_name'
      )
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .leftJoin('users', 'transactions.user_id', 'users.id')
      .where({ 'transactions.shop_id': req.user.shop_id, 'transactions.is_deleted': false });

    if (customer_id) {
      query = query.where({ 'transactions.customer_id': customer_id });
    }

    if (type) {
      query = query.where({ 'transactions.type': type });
    }

    if (start_date) {
      query = query.where('transactions.created_at', '>=', start_date);
    }

    if (end_date) {
      query = query.where('transactions.created_at', '<=', end_date);
    }

    const transactions = await query
      .orderBy('transactions.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('transactions')
      .where({ shop_id: req.user.shop_id, is_deleted: false })
      .count('id as count');

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await db('transactions')
      .select(
        'transactions.*',
        'customers.name as customer_name',
        'users.name as user_name'
      )
      .leftJoin('customers', 'transactions.customer_id', 'customers.id')
      .leftJoin('users', 'transactions.user_id', 'users.id')
      .where({ 'transactions.id': req.params.id, 'transactions.shop_id': req.user.shop_id })
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { customer_id, type, amount, description, reference_number } = req.body;

    const customer = await db('customers')
      .where({ id: customer_id, shop_id: req.user.shop_id })
      .first();

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    let newBalance;
    if (type === 'credit') {
      newBalance = parseFloat(customer.balance) + parseFloat(amount);
    } else if (type === 'payment') {
      newBalance = parseFloat(customer.balance) - parseFloat(amount);
      if (newBalance < 0) {
        newBalance = 0;
      }
    }

    let transaction;
    await db.transaction(async (trx) => {
      transaction = await trx('transactions').insert({
        shop_id: req.user.shop_id,
        customer_id,
        user_id: req.user.id,
        type,
        amount,
        description,
        reference_number,
      }).returning('*');

      transaction = transaction[0];

      await trx('customers')
        .where({ id: customer_id })
        .update({ balance: newBalance, updated_at: trx.fn.now() });
    });

    const updatedCustomer = await db('customers').where({ id: customer_id }).first();

    res.status(201).json({
      ...transaction,
      new_balance: updatedCustomer.balance,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await db('transactions')
      .where({ id: req.params.id, shop_id: req.user.shop_id, is_deleted: false })
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const customer = await db('customers').where({ id: transaction.customer_id }).first();

    let newBalance;
    if (transaction.type === 'credit') {
      newBalance = parseFloat(customer.balance) - parseFloat(transaction.amount);
    } else {
      newBalance = parseFloat(customer.balance) + parseFloat(transaction.amount);
    }

    if (newBalance < 0) newBalance = 0;

    await db.transaction(async (trx) => {
      await trx('transactions')
        .where({ id: req.params.id })
        .update({ is_deleted: true, updated_at: trx.fn.now() });

      await trx('customers')
        .where({ id: transaction.customer_id })
        .update({ balance: newBalance, updated_at: trx.fn.now() });
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, getTransaction, createTransaction, deleteTransaction };

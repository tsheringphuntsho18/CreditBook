const db = require('../db/knex');

const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = db('customers')
      .select('id', 'name', 'phone', 'email', 'address', 'balance', 'created_at')
      .where({ shop_id: req.user.shop_id })
      .orderBy('name', 'asc');

    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike('name', `%${search}%`)
          .orWhereILike('phone', `%${search}%`);
      });
    }

    const customers = await query.limit(limit).offset(offset);
    const [{ count }] = await db('customers')
      .where({ shop_id: req.user.shop_id })
      .count('id as count');

    res.json({
      customers,
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

const getCustomer = async (req, res, next) => {
  try {
    const customer = await db('customers')
      .select('id', 'name', 'phone', 'email', 'address', 'balance', 'created_at', 'updated_at')
      .where({ id: req.params.id, shop_id: req.user.shop_id })
      .first();

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const transactions = await db('transactions')
      .select('id', 'type', 'amount', 'description', 'reference_number', 'created_at')
      .where({ customer_id: customer.id, is_deleted: false })
      .orderBy('created_at', 'desc')
      .limit(50);

    res.json({ ...customer, transactions });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await db('customers').insert({
      name,
      phone,
      email,
      address,
      shop_id: req.user.shop_id,
      balance: 0,
    }).returning('*');

    res.status(201).json(customer[0]);
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await db('customers')
      .where({ id: req.params.id, shop_id: req.user.shop_id })
      .first();

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updated = await db('customers')
      .where({ id: req.params.id })
      .update({ name, phone, email, address, updated_at: db.fn.now() })
      .returning('*');

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await db('customers')
      .where({ id: req.params.id, shop_id: req.user.shop_id })
      .first();

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (parseFloat(customer.balance) !== 0) {
      return res.status(400).json({ error: 'Cannot delete customer with non-zero balance' });
    }

    await db('transactions').where({ customer_id: customer.id }).del();
    await db('customers').where({ id: req.params.id }).del();

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };

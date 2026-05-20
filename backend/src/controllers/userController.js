const bcrypt = require('bcrypt');
const db = require('../db/knex');

const getUsers = async (req, res, next) => {
  try {
    const users = await db('users')
      .select('id', 'email', 'name', 'role', 'shop_id', 'created_at')
      .where({ shop_id: req.user.shop_id });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db('users').insert({
      email,
      password_hash: passwordHash,
      name,
      role: 'employee',
      shop_id: req.user.shop_id,
    }).returning('*');

    res.status(201).json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      shop_id: user[0].shop_id,
      created_at: user[0].created_at,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    const user = await db('users').where({ id: req.params.id }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.shop_id !== req.user.shop_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (password) updates.password_hash = await bcrypt.hash(password, 12);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.updated_at = db.fn.now();

    const updated = await db('users')
      .where({ id: req.params.id })
      .update(updates)
      .returning('*');

    res.json({
      id: updated[0].id,
      email: updated[0].email,
      name: updated[0].name,
      role: updated[0].role,
      shop_id: updated[0].shop_id,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.params.id }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.shop_id !== req.user.shop_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.role === 'owner') {
      return res.status(400).json({ error: 'Cannot delete shop owner' });
    }

    await db('users').where({ id: req.params.id }).del();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };

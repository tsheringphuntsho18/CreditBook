const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');

const register = async (req, res, next) => {
  try {
    const { email, password, name, shopName, shopAddress, shopPhone } = req.body;

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let shop;
    let user;

    await db.transaction(async (trx) => {
      user = await trx('users').insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'owner',
      }).returning('*');

      user = user[0];

      shop = await trx('shops').insert({
        name: shopName,
        address: shopAddress,
        phone: shopPhone,
        owner_id: user.id,
      }).returning('*');

      shop = shop[0];

      await trx('users').where({ id: user.id }).update({ shop_id: shop.id });
    });

    const token = jwt.sign(
      { userId: user.id, shopId: shop.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      shop: {
        id: shop.id,
        name: shop.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const shop = await db('shops').where({ id: user.shop_id }).first();

    const token = jwt.sign(
      { userId: user.id, shopId: user.shop_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      shop: {
        id: shop.id,
        name: shop.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  const shop = await db('shops').where({ id: req.user.shop_id }).first();

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
    shop: shop ? { id: shop.id, name: shop.name } : null,
  });
};

module.exports = { register, login, getMe };

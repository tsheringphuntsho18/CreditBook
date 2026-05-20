const db = require('../db/knex');

const getShops = async (req, res, next) => {
  try {
    const shops = await db('shops')
      .select('id', 'name', 'address', 'phone', 'owner_id', 'created_at')
      .where({ owner_id: req.user.id });

    res.json(shops);
  } catch (error) {
    next(error);
  }
};

const getShop = async (req, res, next) => {
  try {
    const shop = await db('shops')
      .select('id', 'name', 'address', 'phone', 'owner_id', 'created_at', 'updated_at')
      .where({ id: req.params.id })
      .first();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.owner_id !== req.user.id && req.user.shop_id !== shop.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(shop);
  } catch (error) {
    next(error);
  }
};

const updateShop = async (req, res, next) => {
  try {
    const { name, address, phone } = req.body;

    const shop = await db('shops').where({ id: req.params.id }).first();

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can update shop details' });
    }

    const updated = await db('shops')
      .where({ id: req.params.id })
      .update({ name, address, phone, updated_at: db.fn.now() })
      .returning('*');

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = { getShops, getShop, updateShop };

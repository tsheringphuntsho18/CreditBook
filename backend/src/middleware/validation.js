const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
  shopName: Joi.string().min(2).max(100).required(),
  shopAddress: Joi.string().max(255).optional(),
  shopPhone: Joi.string().max(20).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createEmployeeSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
});

const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(255).optional(),
});

const createTransactionSchema = Joi.object({
  customer_id: Joi.string().uuid().required(),
  type: Joi.string().valid('credit', 'payment').required(),
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().max(255).optional(),
  reference_number: Joi.string().max(50).optional(),
});

const updateShopSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  address: Joi.string().max(255).optional(),
  phone: Joi.string().max(20).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createEmployeeSchema,
  createCustomerSchema,
  createTransactionSchema,
  updateShopSchema,
};

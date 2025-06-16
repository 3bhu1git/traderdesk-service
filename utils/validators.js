import Joi from 'joi';

const symbolSchema = Joi.string().alphanum().required();
const quantitySchema = Joi.number().integer().positive().required();
const transactionTypeSchema = Joi.string().valid('BUY', 'SELL').required();
const orderTypeSchema = Joi.string().valid('LIMIT', 'MARKET').required();
const productTypeSchema = Joi.string().valid('CNC', 'MIS', 'NRML').required();
const priceSchema = Joi.number().positive().required();

const orderSchema = Joi.object({
  symbol: symbolSchema,
  quantity: quantitySchema,
  transactionType: transactionTypeSchema,
  orderType: orderTypeSchema,
  productType: productTypeSchema,
  price: priceSchema,
});

const validateOrder = (orderData) => {
  return orderSchema.validate(orderData);
};

const historicalDataSchema = Joi.object({
  symbol: symbolSchema,
  timeframe: Joi.string().valid('1m', '5m', '15m', '1h', '1d').required(),
  from_date: Joi.date().iso().required(),
  to_date: Joi.date().iso().greater(Joi.ref('from_date')).required(),
});

const validateHistoricalData = (data) => {
  return historicalDataSchema.validate(data);
};

export { validateOrder, validateHistoricalData };
const FAQTopic = require('../models/FAQTopic');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = [];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(FAQTopic, ORDER_SCOPE);
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const topics = await FAQTopic.find(filter).sort({ displayOrder: 1 });
    res.json({ success: true, data: topics });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const topic = await FAQTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });
    res.json({ success: true, data: topic });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(FAQTopic, data, ORDER_SCOPE);
    const topic = await FAQTopic.create(data);
    await settleOrder(FAQTopic, topic, ORDER_SCOPE);
    res.status(201).json({ success: true, data: topic });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const topic = await FAQTopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });
    await settleOrder(FAQTopic, topic, ORDER_SCOPE);
    res.json({ success: true, data: topic });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await FAQTopic.findByIdAndDelete(req.params.id);
    await closeOrderGap(FAQTopic, {}, ORDER_SCOPE);
    res.json({ success: true, message: 'Topic deleted.' });
  } catch (err) { next(err); }
};

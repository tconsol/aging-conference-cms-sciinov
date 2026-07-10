const FAQTopic = require('../models/FAQTopic');

exports.getAll = async (req, res, next) => {
  try {
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
    const topic = await FAQTopic.create(req.body);
    res.status(201).json({ success: true, data: topic });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const topic = await FAQTopic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found.' });
    res.json({ success: true, data: topic });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await FAQTopic.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Topic deleted.' });
  } catch (err) { next(err); }
};

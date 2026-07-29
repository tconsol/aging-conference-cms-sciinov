const ImportantDate = require('../models/ImportantDate');
const nextDisplayOrder = require('../utils/autoOrder');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    if (req.query.category) filter.category = req.query.category;
    const dates = await ImportantDate.find(filter).sort({ displayOrder: 1, date: 1 }).populate('edition', 'title year');
    res.json({ success: true, data: dates });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const date = await ImportantDate.findById(req.params.id).populate('edition', 'title year');
    if (!date) return res.status(404).json({ success: false, message: 'Date not found.' });
    res.json({ success: true, data: date });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.displayOrder) data.displayOrder = await nextDisplayOrder(ImportantDate);
    const date = await ImportantDate.create(data);
    res.status(201).json({ success: true, data: date });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const date = await ImportantDate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!date) return res.status(404).json({ success: false, message: 'Date not found.' });
    res.json({ success: true, data: date });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const date = await ImportantDate.findByIdAndDelete(req.params.id);
    if (!date) return res.status(404).json({ success: false, message: 'Date not found.' });
    res.json({ success: true, message: 'Date deleted.' });
  } catch (err) { next(err); }
};

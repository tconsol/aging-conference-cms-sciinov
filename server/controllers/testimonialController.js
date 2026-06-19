const Testimonial = require('../models/Testimonial');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const testimonials = await Testimonial.find(filter).sort({ displayOrder: 1 });
    res.json({ success: true, data: testimonials });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err) { next(err); }
};

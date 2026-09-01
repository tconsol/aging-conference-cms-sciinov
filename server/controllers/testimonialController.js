const Testimonial = require('../models/Testimonial');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = [];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(Testimonial, ORDER_SCOPE);
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
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(Testimonial, data, ORDER_SCOPE);
    if (req.file) {
      const dest = gcsFilename('aging-congress/testimonials', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const t = await Testimonial.create(data);
    await settleOrder(Testimonial, t, ORDER_SCOPE);
    res.status(201).json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    const data = { ...req.body };
    if (req.file) {
      if (testimonial.photoPublicId) await deleteFromGCS(testimonial.photoPublicId);
      const dest = gcsFilename('aging-congress/testimonials', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const t = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    await settleOrder(Testimonial, t, ORDER_SCOPE);
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    if (testimonial.photoPublicId) await deleteFromGCS(testimonial.photoPublicId);
    await testimonial.deleteOne();
    await closeOrderGap(Testimonial, testimonial, ORDER_SCOPE);
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err) { next(err); }
};

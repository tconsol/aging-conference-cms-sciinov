const Partner = require('../models/Partner');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = [];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(Partner, ORDER_SCOPE);
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.type) filter.type = req.query.type;
    const partners = await Partner.find(filter).sort({ displayOrder: 1 });
    res.json({ success: true, data: partners });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    res.json({ success: true, data: partner });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(Partner, data, ORDER_SCOPE);
    if (req.file) {
      const dest = gcsFilename('aging-congress/partners', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.logo = result.url;
      data.logoPublicId = result.filename;
    }
    const partner = await Partner.create(data);
    await settleOrder(Partner, partner, ORDER_SCOPE);
    res.status(201).json({ success: true, data: partner });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    const data = { ...req.body };
    if (req.file) {
      if (partner.logoPublicId) await deleteFromGCS(partner.logoPublicId);
      const dest = gcsFilename('aging-congress/partners', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.logo = result.url;
      data.logoPublicId = result.filename;
    }
    const updated = await Partner.findByIdAndUpdate(req.params.id, data, { new: true });
    await settleOrder(Partner, updated, ORDER_SCOPE);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    if (partner.logoPublicId) await deleteFromGCS(partner.logoPublicId);
    await partner.deleteOne();
    await closeOrderGap(Partner, partner, ORDER_SCOPE);
    res.json({ success: true, message: 'Partner deleted.' });
  } catch (err) { next(err); }
};

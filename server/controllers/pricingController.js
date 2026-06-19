const PricingTier = require('../models/PricingTier');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    const tiers = await PricingTier.find(filter).sort({ displayOrder: 1 }).populate('edition', 'title year');
    res.json({ success: true, data: tiers });
  } catch (err) { next(err); }
};

exports.getActive = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.edition) filter.edition = req.query.edition;
    const tier = await PricingTier.findOne(filter).populate('edition', 'title year');
    res.json({ success: true, data: tier });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const tier = await PricingTier.findById(req.params.id).populate('edition', 'title year');
    if (!tier) return res.status(404).json({ success: false, message: 'Pricing tier not found.' });
    res.json({ success: true, data: tier });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    if (req.body.isActive) {
      await PricingTier.updateMany({ edition: req.body.edition, isActive: true }, { isActive: false });
    }
    const tier = await PricingTier.create(req.body);
    res.status(201).json({ success: true, data: tier });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (req.body.isActive) {
      const existing = await PricingTier.findById(req.params.id);
      if (existing) {
        await PricingTier.updateMany({ edition: existing.edition, _id: { $ne: req.params.id }, isActive: true }, { isActive: false });
      }
    }
    const tier = await PricingTier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tier) return res.status(404).json({ success: false, message: 'Pricing tier not found.' });
    res.json({ success: true, data: tier });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const tier = await PricingTier.findByIdAndDelete(req.params.id);
    if (!tier) return res.status(404).json({ success: false, message: 'Pricing tier not found.' });
    res.json({ success: true, message: 'Pricing tier deleted.' });
  } catch (err) { next(err); }
};

const PricingTier = require('../models/PricingTier');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const {
  syncEditionWindows, syncAllWindows,
  syncTierImportantDate, removeTierImportantDate,
} = require('../utils/pricingWindows');

const ORDER_SCOPE = ["edition"];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(PricingTier, ORDER_SCOPE);
    // Roll the open window forward before answering, so an expired tier never
    // reads back as active
    if (req.query.edition) await syncEditionWindows(req.query.edition);
    else await syncAllWindows();

    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    const tiers = await PricingTier.find(filter).sort({ displayOrder: 1 }).populate('edition', 'title year');
    res.json({ success: true, data: tiers });
  } catch (err) { next(err); }
};

exports.getActive = async (req, res, next) => {
  try {
    if (req.query.edition) await syncEditionWindows(req.query.edition);
    else await syncAllWindows();

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

// Strips empty date strings so they clear rather than failing to cast
const normalise = (body) => {
  const data = { ...body };
  ['startDate', 'endDate', 'deadline'].forEach((k) => {
    if (data[k] === '' || data[k] === null) data[k] = undefined;
  });
  if (data.autoActivate !== undefined) data.autoActivate = Boolean(data.autoActivate);
  return data;
};

exports.create = async (req, res, next) => {
  try {
    const data = normalise(req.body);
    data.displayOrder = await orderForCreate(PricingTier, data, ORDER_SCOPE);

    // Manual activation still means "only one open at a time"
    if (data.isActive) {
      await PricingTier.updateMany({ edition: data.edition, isActive: true }, { isActive: false });
    }

    const tier = await PricingTier.create(data);
    await settleOrder(PricingTier, tier, ORDER_SCOPE);
    await syncTierImportantDate(tier);
    await syncEditionWindows(tier.edition);

    const saved = await PricingTier.findById(tier._id).populate('edition', 'title year');
    res.status(201).json({ success: true, data: saved });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = normalise(req.body);

    if (data.isActive) {
      const existing = await PricingTier.findById(req.params.id);
      if (existing) {
        await PricingTier.updateMany(
          { edition: existing.edition, _id: { $ne: req.params.id }, isActive: true },
          { isActive: false }
        );
      }
    }

    const tier = await PricingTier.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!tier) return res.status(404).json({ success: false, message: 'Pricing tier not found.' });

    await settleOrder(PricingTier, tier, ORDER_SCOPE);
    await syncTierImportantDate(tier);
    await syncEditionWindows(tier.edition);

    const saved = await PricingTier.findById(tier._id).populate('edition', 'title year');
    res.json({ success: true, data: saved });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const tier = await PricingTier.findByIdAndDelete(req.params.id);
    if (!tier) return res.status(404).json({ success: false, message: 'Pricing tier not found.' });

    await closeOrderGap(PricingTier, tier, ORDER_SCOPE);
    await removeTierImportantDate(tier._id);
    await syncEditionWindows(tier.edition);

    res.json({ success: true, message: 'Pricing tier deleted.' });
  } catch (err) { next(err); }
};

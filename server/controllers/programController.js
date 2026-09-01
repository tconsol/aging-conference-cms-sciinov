const ProgramSlot = require('../models/ProgramSlot');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = ["edition","day"];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(ProgramSlot, ORDER_SCOPE);
    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    if (req.query.day) filter.day = Number(req.query.day);
    const slots = await ProgramSlot.find(filter)
      .sort({ day: 1, displayOrder: 1, startTime: 1 })
      .populate('speaker', 'fullName designation organization photo');
    res.json({ success: true, data: slots });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const slot = await ProgramSlot.findById(req.params.id).populate('speaker');
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    res.json({ success: true, data: slot });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(ProgramSlot, data, ORDER_SCOPE);
    const slot = await ProgramSlot.create(data);
    await settleOrder(ProgramSlot, slot, ORDER_SCOPE);
    res.status(201).json({ success: true, data: slot });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const slot = await ProgramSlot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    await settleOrder(ProgramSlot, slot, ORDER_SCOPE);
    res.json({ success: true, data: slot });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const slot = await ProgramSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    await closeOrderGap(ProgramSlot, slot, ORDER_SCOPE);
    res.json({ success: true, message: 'Slot deleted.' });
  } catch (err) { next(err); }
};

exports.reorder = async (req, res, next) => {
  try {
    const { items } = req.body;
    await Promise.all(
      items.map(({ id, displayOrder }) =>
        ProgramSlot.findByIdAndUpdate(id, { displayOrder })
      )
    );
    // Normalise whatever the client sent into a clean 1..n per edition+day
    await healOrders(ProgramSlot, ORDER_SCOPE);
    res.json({ success: true, message: 'Order updated.' });
  } catch (err) { next(err); }
};

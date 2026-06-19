const ScientificSession = require('../models/ScientificSession');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    if (req.query.active === 'true') filter.isActive = true;
    const sessions = await ScientificSession.find(filter).sort({ displayOrder: 1 }).populate('edition', 'title year');
    res.json({ success: true, data: sessions });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const session = await ScientificSession.findById(req.params.id).populate('edition', 'title year');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const session = await ScientificSession.create(req.body);
    res.status(201).json({ success: true, data: session });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const session = await ScientificSession.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const session = await ScientificSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, message: 'Session deleted.' });
  } catch (err) { next(err); }
};

exports.reorder = async (req, res, next) => {
  try {
    const { items } = req.body;
    await Promise.all(
      items.map(({ id, displayOrder }) =>
        ScientificSession.findByIdAndUpdate(id, { displayOrder })
      )
    );
    res.json({ success: true, message: 'Order updated.' });
  } catch (err) { next(err); }
};

const Package = require('../models/Package');

// `perks` arrives as a JSON string from multipart forms and as a real array from
// JSON requests, so normalise both shapes before they reach the model.
const normalise = (body) => {
  const data = { ...body };
  if (typeof data.perks === 'string') {
    try {
      const parsed = JSON.parse(data.perks);
      data.perks = Array.isArray(parsed) ? parsed : [];
    } catch {
      // Fall back to newline-separated text, which is how the admin textarea
      // would send it if the JSON encoding were ever dropped.
      data.perks = data.perks.split('\n').map((p) => p.trim()).filter(Boolean);
    }
  }
  if (Array.isArray(data.perks)) {
    data.perks = data.perks.map((p) => String(p).trim()).filter(Boolean);
  }
  if (typeof data.category === 'string') data.category = data.category.trim().toLowerCase();
  return data;
};

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.category) filter.category = String(req.query.category).trim().toLowerCase();
    const packages = await Package.find(filter).sort({ category: 1, displayOrder: 1, createdAt: 1 });
    res.json({ success: true, data: packages });
  } catch (err) { next(err); }
};

// Distinct categories actually in use, so the admin panel can offer previously
// entered custom groupings instead of making the admin retype them.
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Package.distinct('category');
    res.json({ success: true, data: categories.filter(Boolean).sort() });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const pkg = await Package.create(normalise(req.body));
    res.status(201).json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, normalise(req.body), {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
    res.json({ success: true, message: 'Package deleted.' });
  } catch (err) { next(err); }
};

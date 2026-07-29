const Edition = require('../models/Edition');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
    const editions = await Edition.find().sort({ year: -1 });
    res.json({ success: true, data: editions });
  } catch (err) { next(err); }
};

exports.getActive = async (req, res, next) => {
  try {
    const edition = await Edition.findOne({ isActive: true });
    res.json({ success: true, data: edition });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const edition = await Edition.findOne({ $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { slug: req.params.id }] });
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });
    res.json({ success: true, data: edition });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.highlights && typeof data.highlights === 'string') {
      try { data.highlights = JSON.parse(data.highlights); } catch { data.highlights = []; }
    }
    if (req.file) {
      const dest = gcsFilename('aging-congress/editions', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.bannerImage = result.url;
      data.bannerImagePublicId = result.filename;
    }
    if (data.isActive) {
      await Edition.updateMany({ isActive: true }, { isActive: false });
    }
    const edition = await Edition.create(data);
    res.status(201).json({ success: true, data: edition });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const edition = await Edition.findById(req.params.id);
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });

    const data = { ...req.body };
    if (data.highlights && typeof data.highlights === 'string') {
      try { data.highlights = JSON.parse(data.highlights); } catch { data.highlights = []; }
    }
    if (req.file) {
      if (edition.bannerImagePublicId) await deleteFromGCS(edition.bannerImagePublicId);
      const dest = gcsFilename('aging-congress/editions', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.bannerImage = result.url;
      data.bannerImagePublicId = result.filename;
    }
    if (data.isActive) {
      await Edition.updateMany({ _id: { $ne: req.params.id }, isActive: true }, { isActive: false });
    }
    const updated = await Edition.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const edition = await Edition.findById(req.params.id);
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });
    if (edition.bannerImagePublicId) await deleteFromGCS(edition.bannerImagePublicId);
    await edition.deleteOne();
    res.json({ success: true, message: 'Edition deleted.' });
  } catch (err) { next(err); }
};

exports.setActive = async (req, res, next) => {
  try {
    await Edition.updateMany({ isActive: true }, { isActive: false });
    const edition = await Edition.findByIdAndUpdate(req.params.id, { isActive: true, status: 'active' }, { new: true });
    if (!edition) return res.status(404).json({ success: false, message: 'Edition not found.' });
    res.json({ success: true, data: edition });
  } catch (err) { next(err); }
};

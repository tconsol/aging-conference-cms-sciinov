const Speaker = require('../models/Speaker');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.edition) filter.editions = req.query.edition;
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.featured === 'true') filter.isFeatured = true;
    const speakers = await Speaker.find(filter).sort({ displayOrder: 1, fullName: 1 }).populate('editions', 'title year');
    res.json({ success: true, data: speakers });
  } catch (err) { next(err); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const speaker = await Speaker.findOne({ slug: req.params.slug }).populate('editions', 'title year');
    if (!speaker) return res.status(404).json({ success: false, message: 'Speaker not found.' });
    res.json({ success: true, data: speaker });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const speaker = await Speaker.findById(req.params.id).populate('editions', 'title year');
    if (!speaker) return res.status(404).json({ success: false, message: 'Speaker not found.' });
    res.json({ success: true, data: speaker });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.body.editions && typeof req.body.editions === 'string') {
      data.editions = JSON.parse(req.body.editions);
    }
    if (req.file) {
      const dest = gcsFilename('aging-congress/speakers', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const speaker = await Speaker.create(data);
    res.status(201).json({ success: true, data: speaker });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) return res.status(404).json({ success: false, message: 'Speaker not found.' });

    const data = { ...req.body };
    if (req.body.editions && typeof req.body.editions === 'string') {
      data.editions = JSON.parse(req.body.editions);
    }
    if (req.file) {
      if (speaker.photoPublicId) await deleteFromGCS(speaker.photoPublicId);
      const dest = gcsFilename('aging-congress/speakers', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const updated = await Speaker.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const speaker = await Speaker.findById(req.params.id);
    if (!speaker) return res.status(404).json({ success: false, message: 'Speaker not found.' });
    if (speaker.photoPublicId) await deleteFromGCS(speaker.photoPublicId);
    await speaker.deleteOne();
    res.json({ success: true, message: 'Speaker deleted.' });
  } catch (err) { next(err); }
};

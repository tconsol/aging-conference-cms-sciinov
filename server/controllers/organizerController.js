const Organizer = require('../models/Organizer');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const organizers = await Organizer.find(filter).sort({ displayOrder: 1 });
    res.json({ success: true, data: organizers });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const org = await Organizer.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organizer not found.' });
    res.json({ success: true, data: org });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const dest = gcsFilename('aging-congress/organizers', req.file.mimetype, req.file.originalname);
      const r = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = r.url;
      data.photoPublicId = r.filename;
    }
    const org = await Organizer.create(data);
    res.status(201).json({ success: true, data: org });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const org = await Organizer.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organizer not found.' });
    const data = { ...req.body };
    if (req.file) {
      if (org.photoPublicId) await deleteFromGCS(org.photoPublicId);
      const dest = gcsFilename('aging-congress/organizers', req.file.mimetype, req.file.originalname);
      const r = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = r.url;
      data.photoPublicId = r.filename;
    }
    const updated = await Organizer.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const org = await Organizer.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organizer not found.' });
    if (org.photoPublicId) await deleteFromGCS(org.photoPublicId);
    await org.deleteOne();
    res.json({ success: true, message: 'Organizer deleted.' });
  } catch (err) { next(err); }
};

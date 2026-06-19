const Brochure = require('../models/Brochure');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getLatest = async (req, res, next) => {
  try {
    const brochure = await Brochure.findOne().sort({ createdAt: -1 }).populate('edition', 'title year');
    res.json({ success: true, data: brochure || null });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const brochures = await Brochure.find().sort({ createdAt: -1 }).populate('edition', 'title year');
    res.json({ success: true, data: brochures });
  } catch (err) { next(err); }
};

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const dest = gcsFilename('aging-congress/brochures', req.file.mimetype, req.file.originalname);
    const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
    const brochure = await Brochure.create({
      title: req.body.title || 'congress Brochure',
      fileUrl: result.url,
      filePublicId: result.filename,
      edition: req.body.edition,
    });
    res.status(201).json({ success: true, data: brochure });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) return res.status(404).json({ success: false, message: 'Brochure not found.' });
    if (brochure.filePublicId) await deleteFromGCS(brochure.filePublicId);
    await brochure.deleteOne();
    res.json({ success: true, message: 'Brochure deleted.' });
  } catch (err) { next(err); }
};

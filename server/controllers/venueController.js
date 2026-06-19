const Venue = require('../models/Venue');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.edition) filter.edition = req.query.edition;
    const venues = await Venue.find(filter).populate('edition', 'title year');
    res.json({ success: true, data: venues });
  } catch (err) { next(err); }
};

exports.getByEdition = async (req, res, next) => {
  try {
    const venue = await Venue.findOne({ edition: req.params.editionId });
    res.json({ success: true, data: venue || null });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id).populate('edition', 'title year');
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found.' });
    res.json({ success: true, data: venue });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const dest = gcsFilename('aging-congress/venues', file.mimetype, file.originalname);
        const result = await uploadToGCS(file.buffer, { destination: dest, contentType: file.mimetype });
        photos.push({ url: result.url, publicId: result.filename });
      }
    }
    data.photos = photos;
    const venue = await Venue.create(data);
    res.status(201).json({ success: true, data: venue });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      const newPhotos = [];
      for (const file of req.files) {
        const dest = gcsFilename('aging-congress/venues', file.mimetype, file.originalname);
        const result = await uploadToGCS(file.buffer, { destination: dest, contentType: file.mimetype });
        newPhotos.push({ url: result.url, publicId: result.filename });
      }
      data.$push = { photos: { $each: newPhotos } };
    }
    const venue = await Venue.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found.' });
    res.json({ success: true, data: venue });
  } catch (err) { next(err); }
};

exports.removePhoto = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    await deleteFromGCS(publicId);
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      { $pull: { photos: { publicId } } },
      { new: true }
    );
    res.json({ success: true, data: venue });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found.' });
    for (const photo of venue.photos) {
      await deleteFromGCS(photo.publicId);
    }
    await venue.deleteOne();
    res.json({ success: true, message: 'Venue deleted.' });
  } catch (err) { next(err); }
};

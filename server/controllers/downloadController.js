const Download = require('../models/Download');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = [];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(Download, ORDER_SCOPE);
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.type) filter.type = req.query.type;
    const downloads = await Download.find(filter).sort({ displayOrder: 1 });
    res.json({ success: true, data: downloads });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const dl = await Download.findById(req.params.id);
    if (!dl) return res.status(404).json({ success: false, message: 'Download not found.' });
    res.json({ success: true, data: dl });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(Download, data, ORDER_SCOPE);
    if (req.files?.file) {
      const f = req.files.file[0];
      const dest = gcsFilename('aging-congress/downloads', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.fileUrl = r.url;
      data.filePublicId = r.filename;
    }
    if (req.files?.thumbnail) {
      const f = req.files.thumbnail[0];
      const dest = gcsFilename('aging-congress/downloads', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.thumbnail = r.url;
      data.thumbnailPublicId = r.filename;
    }
    const dl = await Download.create(data);
    await settleOrder(Download, dl, ORDER_SCOPE);
    res.status(201).json({ success: true, data: dl });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const dl = await Download.findById(req.params.id);
    if (!dl) return res.status(404).json({ success: false, message: 'Download not found.' });
    const data = { ...req.body };
    if (req.files?.file) {
      if (dl.filePublicId) await deleteFromGCS(dl.filePublicId);
      const f = req.files.file[0];
      const dest = gcsFilename('aging-congress/downloads', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.fileUrl = r.url;
      data.filePublicId = r.filename;
    }
    if (req.files?.thumbnail) {
      if (dl.thumbnailPublicId) await deleteFromGCS(dl.thumbnailPublicId);
      const f = req.files.thumbnail[0];
      const dest = gcsFilename('aging-congress/downloads', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.thumbnail = r.url;
      data.thumbnailPublicId = r.filename;
    }
    const updated = await Download.findByIdAndUpdate(dl._id, data, { new: true });
    await settleOrder(Download, updated, ORDER_SCOPE);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const dl = await Download.findById(req.params.id);
    if (!dl) return res.status(404).json({ success: false, message: 'Download not found.' });
    if (dl.filePublicId) await deleteFromGCS(dl.filePublicId);
    if (dl.thumbnailPublicId) await deleteFromGCS(dl.thumbnailPublicId);
    await dl.deleteOne();
    await closeOrderGap(Download, dl, ORDER_SCOPE);
    res.json({ success: true, message: 'Download deleted.' });
  } catch (err) { next(err); }
};

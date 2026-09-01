const Report = require('../models/Report');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = [];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(Report, ORDER_SCOPE);
    const filter = {};
    if (req.query.published === 'true') filter.isPublished = true;
    const reports = await Report.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(Report, data, ORDER_SCOPE);
    if (req.files?.coverImage) {
      const f = req.files.coverImage[0];
      const dest = gcsFilename('aging-congress/reports', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.coverImage = r.url;
      data.coverImagePublicId = r.filename;
    }
    if (req.files?.file) {
      const f = req.files.file[0];
      const dest = gcsFilename('aging-congress/reports', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.fileUrl = r.url;
      data.filePublicId = r.filename;
    }
    const report = await Report.create(data);
    await settleOrder(Report, report, ORDER_SCOPE);
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    const data = { ...req.body };
    if (req.files?.coverImage) {
      if (report.coverImagePublicId) await deleteFromGCS(report.coverImagePublicId);
      const f = req.files.coverImage[0];
      const dest = gcsFilename('aging-congress/reports', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.coverImage = r.url;
      data.coverImagePublicId = r.filename;
    }
    if (req.files?.file) {
      if (report.filePublicId) await deleteFromGCS(report.filePublicId);
      const f = req.files.file[0];
      const dest = gcsFilename('aging-congress/reports', f.mimetype, f.originalname);
      const r = await uploadToGCS(f.buffer, { destination: dest, contentType: f.mimetype });
      data.fileUrl = r.url;
      data.filePublicId = r.filename;
    }
    const updated = await Report.findByIdAndUpdate(report._id, data, { new: true });
    await settleOrder(Report, updated, ORDER_SCOPE);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    if (report.coverImagePublicId) await deleteFromGCS(report.coverImagePublicId);
    if (report.filePublicId) await deleteFromGCS(report.filePublicId);
    await report.deleteOne();
    await closeOrderGap(Report, report, ORDER_SCOPE);
    res.json({ success: true, message: 'Report deleted.' });
  } catch (err) { next(err); }
};

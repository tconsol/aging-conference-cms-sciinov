const CommitteeMember = require('../models/CommitteeMember');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');
const {
  orderForCreate, settleOrder, closeOrderGap,
  healOrders,
} = require('../utils/displayOrder');
const ORDER_SCOPE = [];

exports.getAll = async (req, res, next) => {
  try {
    await healOrders(CommitteeMember, ORDER_SCOPE);
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const members = await CommitteeMember.find(filter).sort({ displayOrder: 1, fullName: 1 });
    res.json({ success: true, data: members });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const member = await CommitteeMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, data: member });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.displayOrder = await orderForCreate(CommitteeMember, data, ORDER_SCOPE);
    if (req.file) {
      const dest = gcsFilename('aging-congress/committee', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const member = await CommitteeMember.create(data);
    await settleOrder(CommitteeMember, member, ORDER_SCOPE);
    res.status(201).json({ success: true, data: member });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const member = await CommitteeMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    const data = { ...req.body };
    if (req.file) {
      if (member.photoPublicId) await deleteFromGCS(member.photoPublicId);
      const dest = gcsFilename('aging-congress/committee', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const updated = await CommitteeMember.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    await settleOrder(CommitteeMember, updated, ORDER_SCOPE);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const member = await CommitteeMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (member.photoPublicId) await deleteFromGCS(member.photoPublicId);
    await member.deleteOne();
    await closeOrderGap(CommitteeMember, member, ORDER_SCOPE);
    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) { next(err); }
};

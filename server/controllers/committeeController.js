const CommitteeMember = require('../models/CommitteeMember');
const { uploadToGCS, deleteFromGCS, gcsFilename } = require('../utils/gcs');

exports.getAll = async (req, res, next) => {
  try {
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
    if (req.file) {
      const dest = gcsFilename('aging-congress/committee', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.photo = result.url;
      data.photoPublicId = result.filename;
    }
    const member = await CommitteeMember.create(data);
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
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const member = await CommitteeMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    if (member.photoPublicId) await deleteFromGCS(member.photoPublicId);
    await member.deleteOne();
    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) { next(err); }
};

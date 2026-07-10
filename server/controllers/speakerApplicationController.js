const SpeakerApplication = require('../models/SpeakerApplication');
const { sendEmail } = require('../utils/email');

exports.getAll = async (req, res, next) => {
  try {
    const { status, edition, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (edition) filter.edition = edition;
    const total = await SpeakerApplication.countDocuments(filter);
    const applications = await SpeakerApplication.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('edition', 'title year');
    res.json({ success: true, data: applications, total });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const application = await SpeakerApplication.findById(req.params.id).populate('edition', 'title year');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const application = await SpeakerApplication.create(req.body);
    try {
      await sendEmail({
        to: application.email,
        subject: 'Speaker Application Received Aging congress',
        html: `<p>Dear ${application.name},</p><p>We have received your application to speak at the Aging congress. Our scientific committee will review it and get back to you.</p>`,
      });
    } catch { /* non-critical */ }
    res.status(201).json({ success: true, data: application, message: 'Application submitted.' });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const application = await SpeakerApplication.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    res.json({ success: true, data: application });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await SpeakerApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application deleted.' });
  } catch (err) { next(err); }
};

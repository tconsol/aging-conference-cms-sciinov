const SponsorshipInquiry = require('../models/SponsorshipInquiry');
const { sendEmail } = require('../utils/email');

exports.getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await SponsorshipInquiry.countDocuments(filter);
    const inquiries = await SponsorshipInquiry.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: inquiries, total });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const inquiry = await SponsorshipInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    res.json({ success: true, data: inquiry });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const inquiry = await SponsorshipInquiry.create(req.body);
    try {
      await sendEmail({
        to: inquiry.email,
        subject: 'Sponsorship Inquiry Received Aging congress',
        html: `<p>Dear ${inquiry.contactPerson},</p><p>We have received your sponsorship inquiry. Our team will contact you shortly.</p>`,
      });
    } catch { /* non-critical */ }
    res.status(201).json({ success: true, data: inquiry, message: 'Inquiry submitted.' });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const inquiry = await SponsorshipInquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    res.json({ success: true, data: inquiry });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await SponsorshipInquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Inquiry deleted.' });
  } catch (err) { next(err); }
};

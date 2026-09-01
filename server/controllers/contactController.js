const ContactMessage = require('../models/ContactMessage');
const { sendEmail } = require('../utils/email');
const { broadcast } = require('../utils/sseClients');

exports.submit = async (req, res, next) => {
  try {
    const message = await ContactMessage.create(req.body);

    broadcast('new_contact', {
      id: message._id,
      name: message.name,
      email: message.email,
      subject: message.subject,
      createdAt: message.createdAt,
    });

    try {
      await sendEmail({
        to: message.email,
        subject: 'Message Received Aging congress',
        html: `<p>Dear ${message.name},</p><p>Thank you for contacting us. We will get back to you within 48 hours.</p>`,
      });
    } catch { /* non-critical */ }
    res.status(201).json({ success: true, data: message, message: 'Message sent.' });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: messages, total });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

exports.toggleRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    msg.isRead = !msg.isRead;
    await msg.save();
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) { next(err); }
};

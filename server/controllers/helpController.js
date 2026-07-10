const FAQ = require('../models/FAQ');
const SupportTicket = require('../models/SupportTicket');
const { sendEmail } = require('../utils/email');

// FAQs
exports.getAllFAQs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;
    const faqs = await FAQ.find(filter).sort({ displayOrder: 1 }).populate('topic', 'name subtitle icon displayOrder');
    res.json({ success: true, data: faqs });
  } catch (err) { next(err); }
};

exports.createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) { next(err); }
};

exports.updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
    res.json({ success: true, data: faq });
  } catch (err) { next(err); }
};

exports.removeFAQ = async (req, res, next) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'FAQ deleted.' });
  } catch (err) { next(err); }
};

// Support Tickets
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: tickets, total });
  } catch (err) { next(err); }
};

exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.submitTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.create(req.body);
    try {
      await sendEmail({
        to: ticket.email,
        subject: 'Support Request Received Aging congress',
        html: `<p>Dear ${ticket.name},</p><p>We received your support request and will respond as soon as possible.</p><p>Reference: ${ticket._id}</p>`,
      });
    } catch { /* non-critical */ }
    res.status(201).json({ success: true, data: ticket, message: 'Support request submitted.' });
  } catch (err) { next(err); }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
    res.json({ success: true, data: ticket });
  } catch (err) { next(err); }
};

exports.removeTicket = async (req, res, next) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted.' });
  } catch (err) { next(err); }
};

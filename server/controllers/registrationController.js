const Registration = require('../models/Registration');
const PricingTier = require('../models/PricingTier');
const { sendEmail } = require('../utils/email');

exports.getAll = async (req, res, next) => {
  try {
    const { edition, paymentStatus, category, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (edition) filter.edition = edition;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Registration.countDocuments(filter);
    const registrations = await Registration.find(filter)
      .sort({ registeredAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('edition', 'title year')
      .populate('pricingTier', 'name label');
    res.json({ success: true, data: registrations, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('edition').populate('pricingTier');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.pricingTier && data.category) {
      const tier = await PricingTier.findById(data.pricingTier);
      if (tier) {
        data.amount = tier.prices?.[data.category] ?? 0;
        data.currency = 'USD';
      } else {
        delete data.pricingTier;
        delete data.amount;
      }
    } else {
      delete data.amount;
      delete data.pricingTier;
    }
    const registration = await Registration.create(data);

    try {
      await sendEmail({
        to: registration.email,
        subject: 'Registration Received Aging congress',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#1e40af;">Registration Received</h2>
            <p>Dear ${registration.firstName} ${registration.lastName},</p>
            <p>Your congress registration has been received. Payment confirmation will follow once processed.</p>
            <p style="color:#6b7280;font-size:13px;">Reference ID: ${registration._id}</p>
          </div>
        `,
      });
    } catch {
      // Non-critical
    }

    res.status(201).json({ success: true, data: registration, message: 'Registration submitted.' });
  } catch (err) { next(err); }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const reg = await Registration.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, transactionId },
      { new: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, message: 'Registration deleted.' });
  } catch (err) { next(err); }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const { edition } = req.query;
    const filter = edition ? { edition } : {};
    const registrations = await Registration.find(filter).populate('edition', 'title year');

    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Country', 'Organization', 'Category', 'Attendance Mode', 'Amount', 'Payment Status', 'Registered At'];
    const rows = registrations.map((r) => [
      r._id, r.firstName, r.lastName, r.email, r.phone, r.country,
      r.organization, r.category, r.attendanceMode, r.amount,
      r.paymentStatus, r.registeredAt?.toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v ?? ''}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

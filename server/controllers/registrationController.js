const Registration = require('../models/Registration');
const PricingTier = require('../models/PricingTier');
const { sendEmail } = require('../utils/email');
const paypal = require('../utils/paypal');

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
            <p>Dear ${registration.title ? registration.title + ' ' : ''}${registration.firstName} ${registration.lastName},</p>
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

exports.handlePaypalWebhook = async (req, res, next) => {
  try {
    // Verify signature using raw body (Buffer)
    const isValid = await paypal.verifyWebhookSignature({
      headers: req.headers,
      rawBody: req.body, // raw Buffer — express.raw() is applied to this route
    });

    if (!isValid) {
      console.warn('[PayPal Webhook] Signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    const eventType = event.event_type;
    const resource = event.resource;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const captureId = resource.id;
      // Find registration by transactionId OR by the supplementary data custom_id if set.
      // We stored captureId during capturePaypalOrder; here we match on it.
      const registration = await Registration.findOneAndUpdate(
        { transactionId: captureId, paymentStatus: { $ne: 'confirmed' } },
        { paymentStatus: 'confirmed' },
        { new: true }
      );
      if (registration) {
        console.log(`[PayPal Webhook] Confirmed registration ${registration._id}`);
        try {
          await sendEmail({
            to: registration.email,
            subject: 'Payment Confirmed – Aging Congress Registration',
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
                <h2 style="color:#0f766e;">Payment Confirmed</h2>
                <p>Dear ${registration.title ? registration.title + ' ' : ''}${registration.firstName} ${registration.lastName},</p>
                <p>Your payment of <strong>USD ${registration.amount}</strong> has been received and your congress registration is confirmed.</p>
                <p><strong>Transaction ID:</strong> ${captureId}</p>
                <p style="color:#6b7280;font-size:13px;">Reference ID: ${registration._id}</p>
              </div>
            `,
          });
        } catch { /* Non-critical */ }
      }
    }

    // All failure/reversal events → cancelled
    if ([
      'PAYMENT.CAPTURE.DENIED',
      'PAYMENT.CAPTURE.DECLINED',
      'PAYMENT.CAPTURE.REFUNDED',
      'PAYMENT.CAPTURE.REVERSED',
    ].includes(eventType)) {
      const captureId = resource.id;
      await Registration.findOneAndUpdate(
        { transactionId: captureId },
        { paymentStatus: 'cancelled' }
      );
      console.log(`[PayPal Webhook] Marked cancelled (${eventType}) for capture ${captureId}`);
    }

    if (eventType === 'PAYMENT.CAPTURE.PENDING') {
      // Payment held by PayPal (e.g. eCheck, review) — keep as pending, log it
      const captureId = resource.id;
      console.log(`[PayPal Webhook] Capture pending for ${captureId} — awaiting PayPal release`);
    }

    // Always return 200 quickly — PayPal retries on any non-2xx
    res.sendStatus(200);
  } catch (err) {
    console.error('[PayPal Webhook] Error:', err.message);
    // Still return 200 to stop PayPal retrying on processing errors
    res.sendStatus(200);
  }
};

async function verifyCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // skip if not configured
  const res = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
    { method: 'POST' }
  );
  const data = await res.json();
  return data.success === true;
}

exports.createPaypalOrder = async (req, res, next) => {
  try {
    const { captchaToken, ...rawData } = req.body;
    const data = { ...rawData };

    // Verify captcha
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const valid = await verifyCaptcha(captchaToken);
      if (!valid) {
        return res.status(400).json({ success: false, message: 'CAPTCHA verification failed. Please check the box and try again.' });
      }
    }

    // Re-verify amount server-side
    if (data.pricingTier && data.category) {
      const tier = await PricingTier.findById(data.pricingTier);
      if (tier) {
        data.amount = tier.prices?.[data.category] ?? 0;
        data.currency = 'USD';
      }
    }

    if (!data.amount || data.amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid registration amount.' });
    }

    // Save pending registration
    const registration = await Registration.create({ ...data, paymentStatus: 'pending' });

    // Create PayPal order
    const order = await paypal.createOrder({
      amount: data.amount,
      currency: data.currency || 'USD',
      description: `Congress Registration – ${data.category}`,
    });

    res.json({ success: true, orderId: order.id, registrationId: registration._id });
  } catch (err) { next(err); }
};

exports.capturePaypalOrder = async (req, res, next) => {
  try {
    const { orderId, registrationId } = req.body;
    if (!orderId || !registrationId) {
      return res.status(400).json({ success: false, message: 'orderId and registrationId required.' });
    }

    const capture = await paypal.captureOrder(orderId);

    if (capture.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Payment not completed.' });
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    const registration = await Registration.findByIdAndUpdate(
      registrationId,
      { paymentStatus: 'confirmed', transactionId: captureId },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    try {
      await sendEmail({
        to: registration.email,
        subject: 'Payment Confirmed – Aging Congress Registration',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#0f766e;">Payment Confirmed</h2>
            <p>Dear ${registration.title ? registration.title + ' ' : ''}${registration.firstName} ${registration.lastName},</p>
            <p>Your payment of <strong>USD ${registration.amount}</strong> has been received and your congress registration is confirmed.</p>
            <p><strong>Transaction ID:</strong> ${captureId}</p>
            <p style="color:#6b7280;font-size:13px;">Reference ID: ${registration._id}</p>
          </div>
        `,
      });
    } catch {
      // Non-critical
    }

    res.json({ success: true, data: registration });
  } catch (err) { next(err); }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const { edition } = req.query;
    const filter = edition ? { edition } : {};
    const registrations = await Registration.find(filter).populate('edition', 'title year');

    const headers = ['ID', 'Title', 'First Name', 'Last Name', 'Email', 'Alternate Email', 'Phone', 'WhatsApp', 'Country', 'Organization', 'Category', 'Attendance Mode', 'Amount', 'Currency', 'Payment Status', 'Transaction ID', 'Registered At'];
    const rows = registrations.map((r) => [
      r._id, r.title, r.firstName, r.lastName, r.email, r.alternateEmail, r.phone, r.whatsapp,
      r.country, r.organization, r.category, r.attendanceMode, r.amount, r.currency,
      r.paymentStatus, r.transactionId, r.registeredAt?.toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v ?? ''}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.send(csv);
  } catch (err) { next(err); }
};

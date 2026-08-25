const Registration = require('../models/Registration');
const PricingTier = require('../models/PricingTier');
const { sendEmail } = require('../utils/email');
const paypal = require('../utils/paypal');

const CATEGORY_LABELS = {
  oral_inperson:    'Oral Presentation (In-Person)',
  oral_virtual:     'Oral Presentation (Virtual)',
  poster_inperson:  'Poster Presentation (In-Person)',
  poster_virtual:   'Poster Presentation (Virtual)',
  listener_inperson:'Listener (In-Person)',
  listener_virtual: 'Listener (Virtual)',
  student:          'Student',
};

const ATTENDANCE_LABELS = {
  in_person: 'In-Person',
  virtual:   'Virtual',
};

function buildConfirmationEmail(reg, captureId) {
  const fullName = `${reg.title ? reg.title + ' ' : ''}${reg.firstName} ${reg.lastName}`;
  const editionLine = reg.edition ? `${reg.edition.title}${reg.edition.year ? ' (' + reg.edition.year + ')' : ''}` : '—';
  const categoryLine = CATEGORY_LABELS[reg.category] || reg.category || '—';
  const attendanceLine = ATTENDANCE_LABELS[reg.attendanceMode] || reg.attendanceMode || '—';
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const refId = String(reg._id).toUpperCase().slice(-8);

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;width:40%">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:500;border-bottom:1px solid #f1f5f9">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);padding:36px 40px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.6);text-transform:uppercase">Aging Congress</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.2">Registration Confirmed</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75)">Your payment was received. Welcome to the congress!</p>
    </div>

    <!-- Greeting -->
    <div style="padding:28px 40px 0">
      <p style="margin:0;font-size:15px;color:#334155">Dear <strong>${fullName}</strong>,</p>
      <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.6">
        Thank you for registering for the Aging Congress. Your registration is now confirmed and your spot is secured.
        Please keep this email as your official registration receipt.
      </p>
    </div>

    <!-- Registration Details -->
    <div style="padding:24px 40px 0">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#0d9488;text-transform:uppercase">Registration Details</p>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
        ${row('Name', fullName)}
        ${row('Email', reg.email)}
        ${reg.phone ? row('Phone', reg.phone) : ''}
        ${reg.country ? row('Country', reg.country) : ''}
        ${reg.organization ? row('Institution / Organization', reg.organization) : ''}
        ${row('Congress Edition', editionLine)}
        ${row('Registration Category', categoryLine)}
        ${row('Attendance Mode', attendanceLine)}
      </table>
    </div>

    <!-- Invoice -->
    <div style="padding:24px 40px 0">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#0d9488;text-transform:uppercase">Payment Invoice</p>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
        ${row('Invoice Date', invoiceDate)}
        ${row('Invoice Ref', '#INV-' + refId)}
        ${row('Transaction ID', captureId || '—')}
        ${row('Payment Method', 'PayPal')}
        ${row('Currency', reg.currency || 'USD')}
        <tr>
          <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#0f766e;background:#f0fdfa">Total Paid</td>
          <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#0f766e;background:#f0fdfa">USD ${Number(reg.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>

    <!-- Footer note -->
    <div style="padding:24px 40px 32px">
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        If you have any questions about your registration, please reply to this email or contact our support team.
        Please retain this email as proof of registration.
      </p>
      <p style="margin:16px 0 0;font-size:11px;color:#cbd5e1">
        Reference ID: ${reg._id}
      </p>
    </div>

    <!-- Bottom bar -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;text-align:center">
      <p style="margin:0;font-size:11px;color:#94a3b8">© ${new Date().getFullYear()} Aging Congress. All rights reserved.</p>
    </div>

  </div>
</body>
</html>`;
}

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
    ).populate('edition', 'title year');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    try {
      await sendEmail({
        to: registration.email,
        subject: `Registration Confirmed – Aging Congress${registration.edition?.year ? ' ' + registration.edition.year : ''}`,
        html: buildConfirmationEmail(registration, captureId),
      });
    } catch {
      // Non-critical — don't fail the response if email errors
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

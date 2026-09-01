const Registration = require('../models/Registration');
const RegistrationIntent = require('../models/RegistrationIntent');
const PricingTier = require('../models/PricingTier');
const Edition = require('../models/Edition');
const SiteSettings = require('../models/SiteSettings');
const { sendEmail } = require('../utils/email');
const paypal = require('../utils/paypal');
const { broadcast } = require('../utils/sseClients');
const { priceFor } = require('../utils/pricing');

const CATEGORY_LABELS = {
  oral_inperson:     'Oral Presentation (In-Person)',
  oral_virtual:      'Oral Presentation (Virtual)',
  poster_inperson:   'Poster Presentation (In-Person)',
  poster_virtual:    'Poster Presentation (Virtual)',
  listener_inperson: 'Listener (In-Person)',
  listener_virtual:  'Listener (Virtual)',
  student:           'Student',
};

const ATTENDANCE_LABELS = {
  in_person: 'In-Person',
  virtual:   'Virtual',
};

// ── Site context cache (refreshes every 5 min) ───────────────────────────────
let _siteCtxCache = null;
let _siteCtxAt = 0;

async function getSiteCtx() {
  if (_siteCtxCache && Date.now() - _siteCtxAt < 5 * 60 * 1000) return _siteCtxCache;
  const [settings, edition] = await Promise.all([
    SiteSettings.findOne().lean(),
    Edition.findOne({ isActive: true }).lean(),
  ]);
  const clientUrls = (process.env.CLIENT_URL || '').split(',').map((u) => u.trim()).filter(Boolean);
  const clientUrl = clientUrls.find((u) => u.startsWith('https://')) || clientUrls[0] || '';
  _siteCtxCache = {
    siteName:     settings?.siteName     || 'Aging Congress',
    contactEmail: settings?.contactEmail || process.env.EMAIL_FROM || '',
    clientUrl,
    editionLabel: edition ? `${edition.title} ${edition.year}` : '',
  };
  _siteCtxAt = Date.now();
  return _siteCtxCache;
}

function buildConfirmationEmail(reg, captureId, ctx = {}) {
  const siteName    = ctx.siteName    || 'Aging Congress';
  const contactEmail = ctx.contactEmail || '';
  const fullName    = `${reg.title ? reg.title + ' ' : ''}${reg.firstName} ${reg.lastName}`;
  const editionLine = reg.edition ? `${reg.edition.title}${reg.edition.year ? ' (' + reg.edition.year + ')' : ''}` : (ctx.editionLabel || '');
  const categoryLine  = CATEGORY_LABELS[reg.category]  || reg.category  || '';
  const attendanceLine = ATTENDANCE_LABELS[reg.attendanceMode] || reg.attendanceMode || '';
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const refId = String(reg._id).toUpperCase().slice(-8);
  const year = new Date().getFullYear();

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

    <div style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);padding:36px 40px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.6);text-transform:uppercase">${siteName}</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.2">Registration Confirmed</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75)">Your payment was received. Welcome to the congress!</p>
    </div>

    <div style="padding:28px 40px 0">
      <p style="margin:0;font-size:15px;color:#334155">Dear <strong>${fullName}</strong>,</p>
      <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.6">
        Thank you for registering for ${siteName}. Your registration is now confirmed and your spot is secured.
        Please keep this email as your official registration receipt.
      </p>
    </div>

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

    <div style="padding:24px 40px 0">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#0d9488;text-transform:uppercase">Payment Invoice</p>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
        ${row('Invoice Date', invoiceDate)}
        ${row('Invoice Ref', '#INV-' + refId)}
        ${row('Transaction ID', captureId || '')}
        ${row('Payment Method', 'PayPal')}
        ${row('Currency', reg.currency || 'USD')}
        <tr>
          <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#0f766e;background:#f0fdfa">Total Paid</td>
          <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#0f766e;background:#f0fdfa">USD ${Number(reg.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>

    <div style="padding:24px 40px 32px">
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        If you have any questions, please reply to this email${contactEmail ? ` or contact us at <a href="mailto:${contactEmail}" style="color:#0d9488">${contactEmail}</a>` : ''}.
        Please retain this email as proof of registration.
      </p>
      <p style="margin:16px 0 0;font-size:11px;color:#cbd5e1">Reference ID: ${reg._id}</p>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;text-align:center">
      <p style="margin:0;font-size:11px;color:#94a3b8">© ${year} ${siteName}. All rights reserved.</p>
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
        // Same formula as createPaypalOrder — a bare per-person price silently
        // discards participants/accompanying and can zero out valid totals.
        const ACCOMPANYING_RATE = 300;
        const TAX_RATE = 0.048;
        const round2 = (n) => Math.round(n * 100) / 100;

        const basePrice = priceFor(tier, data.category);
        const participants = Math.max(1, Number(data.participants) || 1);
        const accompanying = Math.max(0, Number(data.accompanyingPersons) || 0);
        const subtotal = basePrice * participants + accompanying * ACCOMPANYING_RATE;
        const taxAmount = round2(subtotal * TAX_RATE);

        data.amount = round2(subtotal + taxAmount);
        data.currency = 'USD';
        data.participants = participants;
        data.accompanyingPersons = accompanying;
        data.accompanyingFee = round2(accompanying * ACCOMPANYING_RATE);
        data.taxAmount = taxAmount;
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
    const { paymentStatus, transactionId, paymentMethod } = req.body;
    const update = { paymentStatus, transactionId };
    if (paymentMethod !== undefined) update.paymentMethod = paymentMethod || undefined;

    const reg = await Registration.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, data: reg });
  } catch (err) { next(err); }
};

// Admin-created registration (offline / manual payment capture)
exports.adminCreate = async (req, res, next) => {
  try {
    const allowed = [
      'edition', 'title', 'firstName', 'lastName', 'email', 'phone',
      'alternateEmail', 'whatsapp', 'country', 'organization',
      'category', 'attendanceMode', 'pricingTier', 'amount', 'currency',
      'paymentStatus', 'paymentMethod', 'transactionId', 'notes',
    ];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined && req.body[k] !== '') data[k] = req.body[k];
    });
    data.createdByAdmin = true;

    // Derive amount from the pricing tier when the admin didn't type one in
    if (data.pricingTier && data.category && (data.amount === undefined || data.amount === null)) {
      const tier = await PricingTier.findById(data.pricingTier);
      if (tier) data.amount = priceFor(tier, data.category);
    }
    if (data.amount !== undefined) data.amount = Number(data.amount);
    if (!data.currency) data.currency = 'USD';

    const registration = await Registration.create(data);
    await registration.populate('edition', 'title year');

    broadcast('new_registration', {
      id: registration._id,
      email: registration.email,
      firstName: registration.firstName,
      lastName: registration.lastName,
      paymentStatus: registration.paymentStatus,
      amount: registration.amount,
    });

    // Optional confirmation email only when the admin ticks the box
    if (req.body.sendEmail && registration.paymentStatus === 'confirmed') {
      try {
        const ctx = await getSiteCtx();
        await sendEmail({
          to: registration.email,
          subject: `Registration Confirmed ${ctx.editionLabel || ctx.siteName}`,
          html: buildConfirmationEmail(registration, registration.transactionId, ctx),
        });
      } catch {
        // Non-critical record is already saved
      }
    }

    res.status(201).json({ success: true, data: registration, message: 'Registration created.' });
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
      rawBody: req.body, // raw Buffer express.raw() is applied to this route
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
        { paymentStatus: 'confirmed', paymentMethod: 'paypal' },
        { new: true }
      ).populate('edition', 'title year');
      if (registration) {
        console.log(`[PayPal Webhook] Confirmed registration ${registration._id}`);
        try {
          const ctx = await getSiteCtx();
          await sendEmail({
            to: registration.email,
            subject: `Registration Confirmed – ${ctx.editionLabel || ctx.siteName}`,
            html: buildConfirmationEmail(registration, captureId, ctx),
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
      // Payment held by PayPal (e.g. eCheck, review) keep as pending, log it
      const captureId = resource.id;
      console.log(`[PayPal Webhook] Capture pending for ${captureId} awaiting PayPal release`);
    }

    // Always return 200 quickly PayPal retries on any non-2xx
    res.sendStatus(200);
  } catch (err) {
    console.error('[PayPal Webhook] Error:', err.message);
    // Still return 200 to stop PayPal retrying on processing errors
    res.sendStatus(200);
  }
};

/**
 * Returns { ok, reason }. CAPTCHA is mandatory and fails closed: an unset
 * RECAPTCHA_SECRET_KEY is treated as a server misconfiguration, not permission
 * to skip verification — a silent bypass here is exactly what let unverified
 * submissions through undetected before.
 *
 * Distinguishing "token missing" from "token rejected" matters too: a missing
 * token almost always means the client never rendered the widget (e.g.
 * VITE_RECAPTCHA_SITE_KEY absent from that build) — a deploy misconfiguration,
 * not a real bot submission. A generic "verification failed" message for both
 * makes that indistinguishable from the server logs.
 */
async function verifyCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error('[reCAPTCHA] RECAPTCHA_SECRET_KEY is not set — refusing to accept unverified submissions.');
    return {
      ok: false,
      reason: 'unconfigured',
      message: 'Registration is temporarily unavailable (CAPTCHA not configured). Please contact support.',
    };
  }

  if (!token) {
    return {
      ok: false,
      reason: 'missing',
      message: 'CAPTCHA token missing. If this persists, VITE_RECAPTCHA_SITE_KEY is likely absent from the client build.',
    };
  }

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  if (data.success === true) return { ok: true };

  console.warn('[reCAPTCHA] verification failed:', data['error-codes']);
  return { ok: false, reason: 'rejected', message: 'CAPTCHA verification failed. Please check the box and try again.' };
}

function buildPendingReminderEmail(data, ctx = {}) {
  const siteName     = ctx.siteName     || 'Aging Congress';
  const editionLabel = ctx.editionLabel || '';
  const contactEmail = ctx.contactEmail || '';
  const registerUrl  = ctx.clientUrl ? `${ctx.clientUrl}/registration` : '';
  const fullName     = `${data.title ? data.title + ' ' : ''}${data.firstName} ${data.lastName}`;
  const isIndia      = (data.country || '').toLowerCase() === 'india';
  const year         = new Date().getFullYear();

  // Registration summary rows (if intent data is available)
  const summaryRows = [
    data.category ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;width:42%">Category</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${CATEGORY_LABELS[data.category] || data.category}</td></tr>` : '',
    data.pricingTierLabel ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Pricing Tier</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.pricingTierLabel}</td></tr>` : '',
    data.participants > 1 ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Participants</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.participants}</td></tr>` : '',
    data.accompanying > 0 ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Accompanying Persons</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.accompanying}</td></tr>` : '',
    data.amount > 0 ? `<tr><td style="padding:10px 16px;font-size:14px;font-weight:700;color:#0f766e;background:#f0fdfa">Estimated Amount</td><td style="padding:10px 16px;font-size:16px;font-weight:700;color:#0f766e;background:#f0fdfa">USD ${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>` : '',
  ].filter(Boolean).join('');

  const razorpayNote = isIndia ? `
    <tr>
      <td colspan="2" style="padding:14px 16px;background:#fffbeb;font-size:13px;color:#92400e;line-height:1.6">
        <strong>For participants in India:</strong> As PayPal is currently restricted, we can provide you with a secure
        <strong>Razorpay payment link</strong>. Please reply to this email and we will send you the link.
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">

    <div style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);padding:32px 40px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.65);text-transform:uppercase">${editionLabel || siteName}</p>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2">Registration Reminder</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.78)">Your payment is still pending complete your registration today.</p>
    </div>

    <div style="padding:28px 40px 0">
      <p style="margin:0;font-size:15px;color:#334155">Dear <strong>${fullName}</strong>,</p>
      <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.6">
        We noticed that your registration for ${editionLabel || siteName} is not yet complete. Your information has been saved,
        but payment has not been received. Please complete your payment to secure your spot.
      </p>
    </div>

    ${summaryRows ? `
    <div style="padding:20px 40px 0">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#0d9488;text-transform:uppercase">Your Registration Summary</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tr>
          <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;width:42%">Registrant</td>
          <td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${fullName}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Email</td>
          <td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.email}</td>
        </tr>
        ${summaryRows}
        <tr>
          <td style="padding:10px 16px;font-size:13px;color:#6b7280">Payment Status</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#dc2626">Pending</td>
        </tr>
        ${razorpayNote}
      </table>
    </div>` : ''}

    ${registerUrl ? `<div style="padding:24px 40px">
      <a href="${registerUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none">
        Complete Registration →
      </a>
    </div>` : ''}

    <div style="padding:0 40px 28px">
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        If you need assistance, please reply to this email${contactEmail ? ` or reach us at <a href="mailto:${contactEmail}" style="color:#0d9488">${contactEmail}</a>` : ''}. We are happy to help.
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#475569">
        Kind regards,<br>
        <strong>${siteName} Team</strong>${contactEmail ? `<br><a href="mailto:${contactEmail}" style="color:#0d9488">${contactEmail}</a>` : ''}
      </p>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 40px;text-align:center">
      <p style="margin:0;font-size:11px;color:#94a3b8">© ${year} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildMultipleAttemptsEmail(data, ctx = {}) {
  const siteName     = ctx.siteName     || 'Aging Congress';
  const editionLabel = ctx.editionLabel || '';
  const contactEmail = ctx.contactEmail || '';
  const registerUrl  = ctx.clientUrl ? `${ctx.clientUrl}/registration` : '';
  const fullName     = `${data.title ? data.title + ' ' : ''}${data.firstName} ${data.lastName}`;
  const isIndia      = (data.country || '').toLowerCase() === 'india';
  const year         = new Date().getFullYear();

  const summaryRows = [
    data.category ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9;width:42%">Category</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${CATEGORY_LABELS[data.category] || data.category}</td></tr>` : '',
    data.pricingTierLabel ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Pricing Tier</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.pricingTierLabel}</td></tr>` : '',
    data.participants > 1 ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Participants</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.participants}</td></tr>` : '',
    data.accompanying > 0 ? `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #f1f5f9">Accompanying Persons</td><td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${data.accompanying}</td></tr>` : '',
    data.amount > 0 ? `<tr><td style="padding:10px 16px;font-size:14px;font-weight:700;color:#0f766e;background:#f0fdfa">Estimated Amount</td><td style="padding:10px 16px;font-size:16px;font-weight:700;color:#0f766e;background:#f0fdfa">USD ${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>` : '',
  ].filter(Boolean).join('');

  const razorpaySection = isIndia ? `
    <div style="margin:20px 0;padding:16px 20px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0">
      <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6">
        <strong>For participants in India:</strong> As PayPal is currently restricted in India, we can provide you with
        a secure <strong>Razorpay payment link</strong> to complete your registration quickly and conveniently.
        Please reply to this email and we will send you the secure link.
      </p>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">

    <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%);padding:32px 40px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:rgba(255,255,255,0.65);text-transform:uppercase">${editionLabel || siteName} · Registration Assistance</p>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2">We're Here to Help You Register</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.78)">We noticed multiple registration attempts let us assist you.</p>
    </div>

    <div style="padding:28px 40px 0">
      <p style="margin:0;font-size:15px;color:#334155">Dear <strong>${fullName}</strong>,</p>
      <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.6">
        We noticed that you have tried to register for ${editionLabel || siteName} multiple times. Thank you for your patience 
        your registration is not yet complete. We would like to help you finish the process as smoothly as possible.
      </p>
    </div>

    ${summaryRows ? `
    <div style="padding:20px 40px 0">
      <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#1e40af;text-transform:uppercase">Your Last Registration Attempt</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        ${summaryRows}
      </table>
    </div>` : ''}

    <div style="padding:20px 40px 0">
      ${razorpaySection}
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
        If you encountered any issues during the payment step or have questions,
        please reply to this email. We are available to assist you promptly.
      </p>
    </div>

    ${registerUrl ? `<div style="padding:20px 40px">
      <a href="${registerUrl}" style="display:inline-block;background:#1e40af;color:#ffffff;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none">
        Complete My Registration →
      </a>
    </div>` : ''}

    <div style="padding:0 40px 28px">
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
        We look forward to welcoming you to ${editionLabel || siteName}.
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#475569">
        Best regards,<br>
        <strong>${siteName} Team</strong>${contactEmail ? `<br><a href="mailto:${contactEmail}" style="color:#1e40af">${contactEmail}</a>` : ''}
      </p>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 40px;text-align:center">
      <p style="margin:0;font-size:11px;color:#94a3b8">© ${year} ${siteName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

exports.trackIntent = async (req, res, next) => {
  try {
    const { email, firstName, lastName, title, country, category, pricingTierLabel, participants, accompanying, amount, edition } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'email required' });

    const existing = await RegistrationIntent.findOne({ email: email.toLowerCase() });
    const attemptNumber = existing ? existing.attemptCount + 1 : 1;

    const updateFields = {
      email: email.toLowerCase(),
      firstName, lastName, title, country,
      attemptCount: attemptNumber,
      lastAttemptAt: new Date(),
    };
    if (category)         updateFields.category         = category;
    if (pricingTierLabel) updateFields.pricingTierLabel = pricingTierLabel;
    if (participants)     updateFields.participants      = participants;
    if (accompanying != null) updateFields.accompanying = accompanying;
    if (amount)           updateFields.amount            = amount;
    if (edition)          updateFields.edition           = edition;

    const intent = await RegistrationIntent.findOneAndUpdate(
      { email: email.toLowerCase() },
      updateFields,
      { upsert: true, new: true }
    );

    broadcast('new_intent', {
      _id: intent._id,
      email: intent.email,
      firstName: intent.firstName,
      lastName: intent.lastName,
      attemptCount: intent.attemptCount,
      lastAttemptAt: intent.lastAttemptAt,
    });

    // No email here. Reaching the payment step is not abandonment — mailing at
    // this point means anyone who pays a minute later still gets an
    // "incomplete registration" notice. The reminder is sent by
    // `abandonIntent` once the user actually leaves without paying.
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Don't re-mail the same person on every back-navigation or refresh
const ABANDON_REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Called when a user leaves the payment step without completing payment
 * (back button, tab close, or the payment session timing out).
 *
 * Public, like /intent, and reached via sendBeacon — so it stays deliberately
 * conservative: it only ever mails an address that already has a tracked
 * intent, never one supplied out of the blue, and it silently no-ops rather
 * than erroring so an unload-time beacon can't surface failures to the user.
 */
exports.abandonIntent = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!email) return res.json({ success: true, sent: false, reason: 'no-email' });

    const intent = await RegistrationIntent.findOne({ email });
    if (!intent) return res.json({ success: true, sent: false, reason: 'no-intent' });

    // They may have completed payment in another tab, or previously
    const paid = await Registration.findOne({ email, paymentStatus: 'confirmed' }).select('_id').lean();
    if (paid) return res.json({ success: true, sent: false, reason: 'already-paid' });

    if (intent.lastReminderAt && Date.now() - new Date(intent.lastReminderAt).getTime() < ABANDON_REMINDER_COOLDOWN_MS) {
      return res.json({ success: true, sent: false, reason: 'cooldown' });
    }

    const data = {
      email,
      firstName: intent.firstName,
      lastName: intent.lastName,
      title: intent.title,
      country: intent.country,
      category: intent.category,
      pricingTierLabel: intent.pricingTierLabel,
      participants: intent.participants,
      accompanying: intent.accompanying,
      amount: intent.amount,
    };

    try {
      const ctx = await getSiteCtx();
      const repeat = (intent.attemptCount || 1) > 1;
      await sendEmail({
        to: email,
        subject: repeat
          ? `${ctx.editionLabel || ctx.siteName} – Registration Assistance Available`
          : `${ctx.editionLabel || ctx.siteName} – Registration Reminder: Payment Pending`,
        html: repeat ? buildMultipleAttemptsEmail(data, ctx) : buildPendingReminderEmail(data, ctx),
      });

      intent.lastReminderAt = new Date();
      intent.reminderCount = (intent.reminderCount || 0) + 1;
      await intent.save();

      console.log(`[Intent] Abandonment reminder → ${email} (attempt ${intent.attemptCount}, reminder ${intent.reminderCount})`);
      return res.json({ success: true, sent: true });
    } catch (emailErr) {
      console.error('[Intent] Abandonment email failed:', emailErr.message);
      return res.json({ success: true, sent: false, reason: 'email-failed' });
    }
  } catch (err) { next(err); }
};

exports.getIntents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }
    const total = await RegistrationIntent.countDocuments(filter);
    const intents = await RegistrationIntent.find(filter)
      .sort({ lastAttemptAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ success: true, data: intents, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
};

exports.getOneIntent = async (req, res, next) => {
  try {
    const intent = await RegistrationIntent.findById(req.params.id).populate('edition', 'title year');
    if (!intent) return res.status(404).json({ success: false, message: 'Intent not found' });
    res.json({ success: true, data: intent });
  } catch (err) { next(err); }
};

exports.sendIntentReminder = async (req, res, next) => {
  try {
    const intent = await RegistrationIntent.findById(req.params.id);
    if (!intent) return res.status(404).json({ success: false, message: 'Intent not found' });

    const ctx  = await getSiteCtx();
    const data = {
      email: intent.email, firstName: intent.firstName, lastName: intent.lastName,
      title: intent.title, country: intent.country,
      category: intent.category, pricingTierLabel: intent.pricingTierLabel,
      participants: intent.participants, accompanying: intent.accompanying, amount: intent.amount,
    };
    const isMultiple = intent.reminderCount >= 1;
    const html    = isMultiple ? buildMultipleAttemptsEmail(data, ctx) : buildPendingReminderEmail(data, ctx);
    const subject = isMultiple
      ? `${ctx.editionLabel || ctx.siteName} – Registration Assistance Available`
      : `${ctx.editionLabel || ctx.siteName} – Registration Reminder: Payment Pending`;

    await sendEmail({ to: intent.email, subject, html });
    await RegistrationIntent.findByIdAndUpdate(req.params.id, {
      $inc: { reminderCount: 1 },
      lastReminderAt: new Date(),
    });

    res.json({ success: true, message: 'Reminder sent.' });
  } catch (err) { next(err); }
};

exports.sendRegistrationReminder = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('edition', 'title year');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });

    const ctx  = await getSiteCtx();
    const data = {
      email: reg.email, firstName: reg.firstName, lastName: reg.lastName,
      title: reg.title, country: reg.country, category: reg.category,
      pricingTierLabel: reg.pricingTierLabel, participants: reg.participants,
      accompanying: reg.accompanying, amount: reg.amount,
    };
    const html = buildPendingReminderEmail(data, ctx);
    await sendEmail({
      to: reg.email,
      subject: `${ctx.editionLabel || ctx.siteName} – Registration Reminder: Payment Pending`,
      html,
    });

    res.json({ success: true, message: 'Reminder sent.' });
  } catch (err) { next(err); }
};

exports.createPaypalOrder = async (req, res, next) => {
  try {
    const { captchaToken, ...rawData } = req.body;
    const data = { ...rawData };

    // CAPTCHA is mandatory for this endpoint — it fails closed, never silently
    // skips. A missing RECAPTCHA_SECRET_KEY is a server misconfiguration and
    // blocks the request rather than letting unverified submissions through.
    const captcha = await verifyCaptcha(captchaToken);
    if (!captcha.ok) {
      return res.status(400).json({ success: false, message: captcha.message });
    }

    // Recompute the charge server-side rather than trusting the client's total.
    // This previously collapsed to just the bare per-person tier price —
    // dropping participants, accompanying persons and tax entirely — which
    // both undercharged multi-participant registrations and, whenever a
    // tier×category combination had no price set (defaults to 0 in the
    // schema), zeroed out otherwise-valid orders and 400'd them.
    //
    // NOTE: ACCOMPANYING_RATE and TAX_RATE must stay in sync with the same
    // constants in client/src/pages/Registration.jsx — there is no shared
    // config between the two apps yet.
    const ACCOMPANYING_RATE = 300;
    const TAX_RATE = 0.048;
    const round2 = (n) => Math.round(n * 100) / 100;

    if (!data.pricingTier || !data.category) {
      return res.status(400).json({ success: false, message: 'Pricing tier and category are required.' });
    }

    const tier = await PricingTier.findById(data.pricingTier);
    if (!tier) {
      return res.status(400).json({ success: false, message: 'Selected pricing tier is no longer available.' });
    }

    const basePrice = priceFor(tier, data.category);
    const participants = Math.max(1, Number(data.participants) || 1);
    const accompanying = Math.max(0, Number(data.accompanyingPersons) || 0);

    const participantsFee = basePrice * participants;
    const accompanyingFee = accompanying * ACCOMPANYING_RATE;
    const subtotal = participantsFee + accompanyingFee;
    // Discounts aren't trusted from the client — there is no server-verified
    // promo system yet (the UI's promo field is a placeholder that never
    // actually applies one), so this is always 0 today.
    const discount = 0;
    const taxAmount = round2((subtotal - discount) * TAX_RATE);
    const amount = round2(subtotal - discount + taxAmount);

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid registration amount.' });
    }

    data.amount = amount;
    data.currency = 'USD';
    data.participants = participants;
    data.accompanyingPersons = accompanying;
    data.accompanyingFee = round2(accompanyingFee);
    data.taxAmount = taxAmount;

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
      { paymentStatus: 'confirmed', paymentMethod: 'paypal', transactionId: captureId },
      { new: true }
    ).populate('edition', 'title year');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    broadcast('new_registration', {
      _id: registration._id,
      email: registration.email,
      firstName: registration.firstName,
      lastName: registration.lastName,
      paymentStatus: 'confirmed',
      amount: registration.amount,
    });

    try {
      const ctx = await getSiteCtx();
      await sendEmail({
        to: registration.email,
        subject: `Registration Confirmed – ${ctx.editionLabel || ctx.siteName}`,
        html: buildConfirmationEmail(registration, captureId, ctx),
      });
    } catch {
      // Non-critical don't fail the response if email errors
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

const Abstract = require('../models/Abstract');
const { uploadToGCS, deleteFromGCS, gcsFilename, streamGCSFile, gcsPathFromUrl } = require('../utils/gcs');
const { sendEmail } = require('../utils/email');
const { broadcastToAbstract } = require('../utils/ssePortalClients');
const { broadcast } = require('../utils/sseClients');

const STATUS_INFO = {
  received_accepted: {
    label: 'Received and Accepted for Review',
    color: '#0284c7',
    message: 'Your abstract has been received and accepted for review by our scientific committee.',
  },
  under_review: {
    label: 'Under Peer Review Process',
    color: '#7c3aed',
    message: 'Your abstract is currently under peer review process by our scientific committee.',
  },
  decision_pending: {
    label: 'Reviewed Decision Pending',
    color: '#d97706',
    message: 'Your abstract has been reviewed and the final decision is pending.',
  },
  accepted: {
    label: 'Accepted',
    color: '#059669',
    message: 'Congratulations! Your abstract has been accepted for presentation at the congress.',
  },
  rejected: {
    label: 'Not Accepted',
    color: '#dc2626',
    message: 'We regret to inform you that your abstract has not been accepted for presentation at this congress.',
  },
};

const generatePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
};

const generateLoginId = async () => {
  const year = new Date().getFullYear();
  const count = await Abstract.countDocuments({});
  return `ABS-${year}-${String(count + 1).padStart(4, '0')}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { edition, status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (edition) filter.edition = edition;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { abstractTitle: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Abstract.countDocuments(filter);
    const abstracts = await Abstract.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('edition', 'title year')
      .populate('topic', 'title');

    const statusCounts = await Abstract.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const stats = {
      total,
      pending: 0,
      received_accepted: 0,
      under_review: 0,
      decision_pending: 0,
      accepted: 0,
      rejected: 0,
    };
    statusCounts.forEach((s) => { stats[s._id] = s.count; });

    res.json({ success: true, data: abstracts, total, page: Number(page), limit: Number(limit), stats });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const abstract = await Abstract.findById(req.params.id).populate('edition').populate('topic');
    if (!abstract) return res.status(404).json({ success: false, message: 'Abstract not found.' });
    res.json({ success: true, data: abstract });
  } catch (err) { next(err); }
};

// Streams the uploaded abstract file back as an attachment (admin).
exports.downloadFile = async (req, res, next) => {
  try {
    const abstract = await Abstract.findById(req.params.id).select('fileUrl filePublicId fileName');
    if (!abstract) return res.status(404).json({ success: false, message: 'Abstract not found.' });

    const path = abstract.filePublicId || gcsPathFromUrl(abstract.fileUrl);
    if (!path) return res.status(404).json({ success: false, message: 'No file attached.' });

    const ok = await streamGCSFile(res, { filename: path, downloadName: abstract.fileName || 'abstract' });
    if (!ok) return res.status(404).json({ success: false, message: 'File no longer available.' });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const dest = gcsFilename('aging-congress/abstracts', req.file.mimetype, req.file.originalname);
      const result = await uploadToGCS(req.file.buffer, { destination: dest, contentType: req.file.mimetype });
      data.fileUrl = result.url;
      data.filePublicId = result.filename;
      data.fileName = req.file.originalname;
    }

    data.loginId = await generateLoginId();
    data.loginPassword = generatePassword();

    const abstract = await Abstract.create(data);

    // Notify connected admin panels (sidebar badge + live table refresh)
    broadcast('new_abstract', {
      id: abstract._id,
      abstractTitle: abstract.abstractTitle,
      firstName: abstract.firstName,
      lastName: abstract.lastName,
      email: abstract.email,
      loginId: abstract.loginId,
      hasFile: Boolean(abstract.fileUrl),
      createdAt: abstract.createdAt,
    });

    const portalUrl = process.env.PORTAL_URL || process.env.FRONTEND_URL || '';

    try {
      await sendEmail({
        to: abstract.email,
        subject: `Abstract Submission Confirmed ${abstract.loginId}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <div style="background:#1e40af;padding:28px 24px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Abstract Submission Confirmed</h1>
            </div>
            <div style="padding:28px 24px;">
              <p style="margin-top:0;color:#1e293b;">Dear <strong>${abstract.firstName} ${abstract.lastName}</strong>,</p>
              <p style="color:#475569;">Your abstract has been received successfully. Please save the following login credentials to track your submission status:</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 12px 8px 0;font-size:13px;color:#64748b;font-weight:600;width:45%;">Login ID</td>
                    <td style="padding:8px 0;font-size:14px;color:#1e293b;font-family:Courier New,monospace;font-weight:700;">${abstract.loginId}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px 8px 0;font-size:13px;color:#64748b;font-weight:600;">Password</td>
                    <td style="padding:8px 0;font-size:14px;color:#1e293b;font-family:Courier New,monospace;font-weight:700;">${abstract.loginPassword}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px 8px 0;font-size:13px;color:#64748b;font-weight:600;">Reference ID</td>
                    <td style="padding:8px 0;font-size:12px;color:#94a3b8;font-family:Courier New,monospace;">${abstract._id}</td>
                  </tr>
                </table>
              </div>
              ${portalUrl ? `<p style="color:#475569;">Track your submission at: <a href="${portalUrl}" style="color:#1e40af;font-weight:600;">${portalUrl}</a></p>` : ''}
              <p style="color:#475569;">Abstract: <strong>${abstract.abstractTitle}</strong></p>
              <p style="color:#64748b;font-size:13px;">You will receive email notifications when your submission status is updated. Please keep your credentials safe.</p>
            </div>
          </div>
        `,
      });
    } catch {
      // Non-critical don't fail the request
    }

    res.status(201).json({ success: true, data: abstract, message: 'Abstract submitted successfully.' });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const abstract = await Abstract.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );
    if (!abstract) return res.status(404).json({ success: false, message: 'Abstract not found.' });

    const info = STATUS_INFO[status];
    if (info) {
      try {
        await sendEmail({
          to: abstract.email,
          subject: `Abstract Status Update ${info.label}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              <div style="background:#1e40af;padding:28px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">Abstract Status Update</h1>
              </div>
              <div style="padding:28px 24px;">
                <p style="margin-top:0;color:#1e293b;">Dear <strong>${abstract.firstName} ${abstract.lastName}</strong>,</p>
                <p style="color:#475569;">We are writing to inform you that the status of your abstract submission has been updated.</p>
                <div style="border-left:4px solid ${info.color};background:#f8fafc;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
                  <p style="margin:0 0 6px;font-size:13px;color:#64748b;">Abstract Title</p>
                  <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#1e293b;">${abstract.abstractTitle}</p>
                  <p style="margin:0 0 4px;font-size:13px;color:#64748b;">Current Status</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:${info.color};">${info.label}</p>
                </div>
                <p style="color:#475569;">${info.message}</p>
                ${adminNotes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin-top:16px;"><p style="margin:0;font-size:13px;color:#92400e;"><strong>Note from the committee:</strong> ${adminNotes}</p></div>` : ''}
                <p style="color:#64748b;font-size:13px;margin-top:20px;">Login ID: <strong style="font-family:Courier New,monospace;">${abstract.loginId || abstract._id}</strong></p>
              </div>
            </div>
          `,
        });
      } catch {
        // Non-critical
      }
    }

    broadcastToAbstract(abstract._id, 'status_update', {
      status: abstract.status,
      adminNotes: abstract.adminNotes || null,
    });

    res.json({ success: true, data: abstract });
  } catch (err) { next(err); }
};

exports.updateAbstract = async (req, res, next) => {
  try {
    const allowed = [
      'firstName', 'lastName', 'email', 'phone', 'whatsapp',
      'country', 'organization', 'presentationType', 'topicText',
      'abstractTitle', 'abstractText', 'keywords', 'coAuthors',
    ];
    const data = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) data[key] = req.body[key]; });

    const abstract = await Abstract.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).populate('edition').populate('topic');
    if (!abstract) return res.status(404).json({ success: false, message: 'Abstract not found.' });
    res.json({ success: true, data: abstract });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const abstract = await Abstract.findByIdAndDelete(req.params.id);
    if (!abstract) return res.status(404).json({ success: false, message: 'Abstract not found.' });
    if (abstract.filePublicId) {
      try { await deleteFromGCS(abstract.filePublicId); } catch {}
    }
    res.json({ success: true, message: 'Abstract deleted.' });
  } catch (err) { next(err); }
};

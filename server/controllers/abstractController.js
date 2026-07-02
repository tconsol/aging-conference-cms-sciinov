const Abstract = require('../models/Abstract');
const { uploadToGCS, gcsFilename } = require('../utils/gcs');
const { sendEmail } = require('../utils/email');

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
    const stats = { total, pending: 0, under_review: 0, approved: 0, rejected: 0 };
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
    const abstract = await Abstract.create(data);

    try {
      await sendEmail({
        to: abstract.email,
        subject: 'Abstract Submission Confirmed Aging congress',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#1e40af;">Abstract Received</h2>
            <p>Dear ${abstract.firstName} ${abstract.lastName},</p>
            <p>Your abstract "<strong>${abstract.abstractTitle}</strong>" has been received successfully. Our scientific committee will review it and notify you of the decision.</p>
            <p style="color:#6b7280;font-size:13px;">Reference ID: ${abstract._id}</p>
          </div>
        `,
      });
    } catch {
      // Non-critical log but don't fail the request
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
    res.json({ success: true, data: abstract });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const abstract = await Abstract.findByIdAndDelete(req.params.id);
    if (!abstract) return res.status(404).json({ success: false, message: 'Abstract not found.' });
    res.json({ success: true, message: 'Abstract deleted.' });
  } catch (err) { next(err); }
};

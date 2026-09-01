const jwt = require('jsonwebtoken');
const Abstract = require('../models/Abstract');
const { streamGCSFile, gcsPathFromUrl } = require('../utils/gcs');

// Streams the submitter's own uploaded file back as an attachment.
exports.downloadMyFile = async (req, res, next) => {
  try {
    const abstract = await Abstract.findById(req.submitter.abstractId).select('fileUrl filePublicId fileName');
    if (!abstract) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const path = abstract.filePublicId || gcsPathFromUrl(abstract.fileUrl);
    if (!path) return res.status(404).json({ success: false, message: 'No file attached.' });

    const ok = await streamGCSFile(res, { filename: path, downloadName: abstract.fileName || 'abstract' });
    if (!ok) return res.status(404).json({ success: false, message: 'File no longer available.' });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    const abstract = await Abstract.findById(req.submitter.abstractId);
    if (!abstract) return res.status(404).json({ success: false, message: 'Submission not found.' });
    if (abstract.loginPassword !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    abstract.loginPassword = newPassword;
    await abstract.save();
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Login ID and password are required.' });
    }

    const abstract = await Abstract.findOne({ loginId })
      .populate('edition', 'title year')
      .populate('topic', 'title');

    if (!abstract || abstract.loginPassword !== password) {
      return res.status(401).json({ success: false, message: 'Invalid Login ID or password.' });
    }

    const token = jwt.sign(
      { abstractId: abstract._id, loginId: abstract.loginId, type: 'submitter' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, data: abstract });
  } catch (err) { next(err); }
};

exports.getMySubmission = async (req, res, next) => {
  try {
    const abstract = await Abstract.findById(req.submitter.abstractId)
      .populate('edition', 'title year city')
      .populate('topic', 'title');

    if (!abstract) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({ success: true, data: abstract });
  } catch (err) { next(err); }
};

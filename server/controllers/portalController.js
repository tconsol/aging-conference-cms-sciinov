const jwt = require('jsonwebtoken');
const Abstract = require('../models/Abstract');

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

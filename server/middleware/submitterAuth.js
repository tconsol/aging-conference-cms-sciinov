const jwt = require('jsonwebtoken');

const submitterAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'submitter') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    req.submitter = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

module.exports = submitterAuth;

const log = require('../utils/logger').child('api');

// Errors the client caused. These are ordinary traffic, not incidents, so they
// get a single warn line — dumping a stack trace for every failed login or
// missing field is what made the logs unreadable.
const classify = (err) => {
  if (err.name === 'ValidationError') {
    return { status: 400, message: Object.values(err.errors).map((e) => e.message).join('. ') };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return { status: 400, message: `${field} already exists.` };
  }
  if (err.name === 'JsonWebTokenError') return { status: 401, message: 'Invalid token.' };
  if (err.name === 'TokenExpiredError') return { status: 401, message: 'Token expired.' };
  return null;
};

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const known = classify(err);
  const status = known?.status || err.statusCode || 500;
  const message = known?.message || err.message || 'Internal server error';
  const where = `${req.method} ${req.originalUrl.split('?')[0]}`;

  if (status >= 500) {
    // Stack stays on one log entry (a field in production, an indented block in
    // development) instead of scattering across the stream.
    log.error(`${status} ${where} — ${message}`, { stack: err.stack });
  } else {
    log.warn(`${status} ${where} — ${message}`);
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;

const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ctrl = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { addClient, removeClient } = require('../utils/sseClients');

const router = express.Router();

// Public submission
router.post('/submit', ctrl.submit);

// Intent tracking called when user enters payment step
router.post('/intent', ctrl.trackIntent);

// PayPal payment (public user initiates)
router.post('/paypal/create-order', ctrl.createPaypalOrder);
router.post('/paypal/capture-order', ctrl.capturePaypalOrder);

// SSE live-events token via query param (EventSource can't send headers)
router.get('/events', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).end();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) return res.status(401).end();
  } catch {
    return res.status(401).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write('event: connected\ndata: {}\n\n');

  addClient(res);
  req.on('close', () => removeClient(res));
});

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.post('/', ctrl.adminCreate);
router.get('/export/csv', ctrl.exportCSV);
router.get('/intents', ctrl.getIntents);
router.get('/intents/:id', ctrl.getOneIntent);
router.post('/intents/:id/remind', ctrl.sendIntentReminder);
router.post('/:id/remind', ctrl.sendRegistrationReminder);
router.get('/:id', ctrl.getOne);
router.patch('/:id/payment', ctrl.updatePaymentStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;

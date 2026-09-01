const express = require('express');
const jwt = require('jsonwebtoken');
const ctrl = require('../controllers/abstractController');
const portalCtrl = require('../controllers/portalController');
const { protect } = require('../middleware/auth');
const submitterAuth = require('../middleware/submitterAuth');
const { uploadDoc } = require('../middleware/upload');
const { addPortalClient, removePortalClient } = require('../utils/ssePortalClients');

const router = express.Router();

// Public submission
router.post('/submit', uploadDoc.single('file'), ctrl.submit);

// Submitter portal (public login + token-protected me)
router.post('/portal/login', portalCtrl.login);
router.get('/portal/me', submitterAuth, portalCtrl.getMySubmission);
router.patch('/portal/change-password', submitterAuth, portalCtrl.changePassword);
router.get('/portal/file', submitterAuth, portalCtrl.downloadMyFile);

// SSE real-time status updates for submitter portal
router.get('/portal/events', async (req, res) => {
  try {
    const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
    if (decoded.type !== 'submitter') throw new Error('invalid type');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    res.write('event: connected\ndata: {}\n\n');

    addPortalClient(decoded.abstractId, res);
    req.on('close', () => removePortalClient(decoded.abstractId, res));
  } catch {
    res.status(401).end();
  }
});

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/file', ctrl.downloadFile);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id', ctrl.updateAbstract);
router.delete('/:id', ctrl.remove);

module.exports = router;

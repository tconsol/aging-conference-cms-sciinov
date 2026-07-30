const express = require('express');
const ctrl = require('../controllers/abstractController');
const portalCtrl = require('../controllers/portalController');
const { protect } = require('../middleware/auth');
const submitterAuth = require('../middleware/submitterAuth');
const { uploadDoc } = require('../middleware/upload');

const router = express.Router();

// Public submission
router.post('/submit', uploadDoc.single('file'), ctrl.submit);

// Submitter portal (public login + token-protected me)
router.post('/portal/login', portalCtrl.login);
router.get('/portal/me', submitterAuth, portalCtrl.getMySubmission);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id', ctrl.updateAbstract);
router.delete('/:id', ctrl.remove);

module.exports = router;

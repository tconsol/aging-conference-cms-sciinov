const express = require('express');
const ctrl = require('../controllers/sponsorshipController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.post('/submit', ctrl.submit);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;

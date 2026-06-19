const express = require('express');
const ctrl = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.post('/', ctrl.submit);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.patch('/:id/toggle-read', ctrl.toggleRead);
router.delete('/:id', ctrl.remove);

module.exports = router;

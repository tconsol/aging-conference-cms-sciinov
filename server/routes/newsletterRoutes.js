const express = require('express');
const ctrl = require('../controllers/newsletterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.post('/subscribe', ctrl.subscribe);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/export/csv', ctrl.exportCSV);
router.delete('/:id', ctrl.remove);

module.exports = router;

const express = require('express');
const ctrl = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public submission
router.post('/submit', ctrl.submit);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/export/csv', ctrl.exportCSV);
router.get('/:id', ctrl.getOne);
router.patch('/:id/payment', ctrl.updatePaymentStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;

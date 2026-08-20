const express = require('express');
const ctrl = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public submission
router.post('/submit', ctrl.submit);

// PayPal payment (public — user initiates)
router.post('/paypal/create-order', ctrl.createPaypalOrder);
router.post('/paypal/capture-order', ctrl.capturePaypalOrder);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/export/csv', ctrl.exportCSV);
router.get('/:id', ctrl.getOne);
router.patch('/:id/payment', ctrl.updatePaymentStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;

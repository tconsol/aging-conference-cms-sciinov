const express = require('express');
const ctrl = require('../controllers/helpController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/faqs', ctrl.getAllFAQs);
router.post('/tickets', ctrl.submitTicket);

// Admin
router.use(protect);
router.post('/faqs', ctrl.createFAQ);
router.put('/faqs/:id', ctrl.updateFAQ);
router.delete('/faqs/:id', ctrl.removeFAQ);
router.get('/tickets', ctrl.getAllTickets);
router.get('/tickets/:id', ctrl.getTicket);
router.patch('/tickets/:id/status', ctrl.updateTicketStatus);
router.delete('/tickets/:id', ctrl.removeTicket);

module.exports = router;

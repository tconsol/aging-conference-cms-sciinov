const express = require('express');
const ctrl = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Everything here is personal data from public forms — admin only.
router.use(protect);
router.get('/meta', ctrl.getMeta);
router.get('/', ctrl.getAll);

module.exports = router;

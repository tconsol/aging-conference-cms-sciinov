const express = require('express');
const ctrl = require('../controllers/visibilityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public: the switch map the client renders against.
router.get('/', ctrl.getPublic);

// Admin: registry + live counts, and the write path.
router.use(protect);
router.get('/admin', ctrl.getAdmin);
router.patch('/', ctrl.update);

module.exports = router;

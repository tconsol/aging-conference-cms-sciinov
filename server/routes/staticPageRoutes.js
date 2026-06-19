const express = require('express');
const ctrl = require('../controllers/staticPageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/:key', ctrl.getByKey);

// Admin
router.use(protect);
router.put('/:key', ctrl.update);

module.exports = router;

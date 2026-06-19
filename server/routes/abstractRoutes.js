const express = require('express');
const ctrl = require('../controllers/abstractController');
const { protect } = require('../middleware/auth');
const { uploadDoc } = require('../middleware/upload');

const router = express.Router();

// Public submission
router.post('/submit', uploadDoc.single('file'), ctrl.submit);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;

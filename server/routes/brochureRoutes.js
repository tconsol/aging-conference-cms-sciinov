const express = require('express');
const ctrl = require('../controllers/brochureController');
const { protect } = require('../middleware/auth');
const { uploadDoc } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/latest', ctrl.getLatest);

// Admin
router.use(protect);
router.get('/', ctrl.getAll);
router.post('/', uploadDoc.single('file'), ctrl.upload);
router.delete('/:id', ctrl.remove);

module.exports = router;

const express = require('express');
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { uploadAny } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Admin
router.use(protect);
router.post('/', uploadAny.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), ctrl.create);
router.put('/:id', uploadAny.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'file', maxCount: 1 }]), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

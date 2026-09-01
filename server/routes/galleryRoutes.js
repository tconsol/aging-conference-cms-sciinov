const express = require('express');
const ctrl = require('../controllers/galleryController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);

// Admin
router.use(protect);
router.post('/', restrictTo('super_admin'), uploadImage.array('images', 30), ctrl.create);
router.patch('/:id', restrictTo('super_admin'), ctrl.update);
router.delete('/:id', restrictTo('super_admin'), ctrl.remove);

module.exports = router;

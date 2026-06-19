const express = require('express');
const ctrl = require('../controllers/editionController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);
router.get('/active', ctrl.getActive);
router.get('/:id', ctrl.getOne);

// Admin
router.use(protect);
router.post('/', restrictTo('super_admin'), uploadImage.single('bannerImage'), ctrl.create);
router.put('/:id', restrictTo('super_admin'), uploadImage.single('bannerImage'), ctrl.update);
router.patch('/:id/set-active', restrictTo('super_admin'), ctrl.setActive);
router.delete('/:id', restrictTo('super_admin'), ctrl.remove);

module.exports = router;

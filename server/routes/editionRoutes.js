const express = require('express');
const ctrl = require('../controllers/editionController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadImage, uploadAny } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);
router.get('/active', ctrl.getActive);
router.get('/:id', ctrl.getOne);
router.get('/:id/materials/:type/download', ctrl.downloadMaterial);

// Admin
router.use(protect);
router.post('/', restrictTo('super_admin'), uploadImage.single('bannerImage'), ctrl.create);
router.put('/:id', restrictTo('super_admin'), uploadImage.single('bannerImage'), ctrl.update);
router.patch(
  '/:id/materials',
  restrictTo('super_admin'),
  uploadAny.fields([
    { name: 'bookCoverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 },
    { name: 'programCoverImage', maxCount: 1 },
    { name: 'programFile', maxCount: 1 },
  ]),
  ctrl.updateMaterials
);
router.patch('/:id/set-active', restrictTo('super_admin'), ctrl.setActive);
router.delete('/:id', restrictTo('super_admin'), ctrl.remove);

module.exports = router;

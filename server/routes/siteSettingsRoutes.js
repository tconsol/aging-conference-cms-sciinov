const express = require('express');
const ctrl = require('../controllers/siteSettingsController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadImage, uploadDoc } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.get);

// Admin
router.use(protect);
router.patch('/', ctrl.patch);
router.put('/', restrictTo('super_admin'), uploadImage.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), ctrl.update);
router.put('/sample-abstract', uploadDoc.single('sampleAbstract'), ctrl.updateSampleAbstract);
router.delete('/sample-abstract', ctrl.removeSampleAbstract);

module.exports = router;

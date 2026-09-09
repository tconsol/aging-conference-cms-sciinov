const express = require('express');
const ctrl = require('../controllers/staticPageController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/:key', ctrl.getByKey);

// Admin
router.use(protect);
// multipart so an illustration can be saved alongside the page copy
router.put('/:key', uploadImage.single('image'), ctrl.update);

module.exports = router;

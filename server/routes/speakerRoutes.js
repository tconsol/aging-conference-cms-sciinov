const express = require('express');
const ctrl = require('../controllers/speakerController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/:id', ctrl.getOne);

// Admin
router.use(protect);
router.post('/', uploadImage.single('photo'), ctrl.create);
router.put('/:id', uploadImage.single('photo'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

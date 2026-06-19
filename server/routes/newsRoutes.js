const express = require('express');
const ctrl = require('../controllers/newsController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/latest', ctrl.getLatest);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/', ctrl.getAll);

// Admin
router.use(protect);
router.get('/admin/:id', ctrl.getOne);
router.post('/', uploadImage.single('featuredImage'), ctrl.create);
router.put('/:id', uploadImage.single('featuredImage'), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

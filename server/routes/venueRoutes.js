const express = require('express');
const ctrl = require('../controllers/venueController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);
router.get('/by-edition/:editionId', ctrl.getByEdition);
router.get('/:id', ctrl.getOne);

// Admin
router.use(protect);
router.post('/', uploadImage.array('photos', 10), ctrl.create);
router.put('/:id', uploadImage.array('photos', 10), ctrl.update);
router.patch('/:id/remove-photo', ctrl.removePhoto);
router.delete('/:id', ctrl.remove);

module.exports = router;

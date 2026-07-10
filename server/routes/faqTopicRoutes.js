const express = require('express');
const ctrl = require('../controllers/faqTopicController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);

// Admin
router.use(protect);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

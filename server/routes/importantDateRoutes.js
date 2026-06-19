const express = require('express');
const ctrl = require('../controllers/importantDateController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Admin
router.use(protect);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

const express = require('express');
const ctrl = require('../controllers/adminUserController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('super_admin'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/reset-password', ctrl.resetPassword);
router.delete('/:id', ctrl.remove);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');
const {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password required.'),
  ],
  login
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email required.')],
  forgotPassword
);

router.post(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
  ],
  resetPassword
);

// Protected routes
router.use(protect);

router.get('/me', getMe);

router.patch(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters.'),
  ],
  changePassword
);

module.exports = router;

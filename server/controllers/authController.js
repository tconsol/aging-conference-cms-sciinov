const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { sendEmail } = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Contact super admin.',
      });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = signToken(admin._id);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    // Generic response prevents email enumeration
    if (!admin) {
      return res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save({ validateBeforeSave: false });

    const resetURL = `${process.env.ADMIN_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: admin.email,
        subject: 'Aging congress CMS Password Reset',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#1e40af;">Password Reset Request</h2>
            <p>Hi ${admin.name},</p>
            <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetURL}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Reset Password</a>
            <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch {
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;
      await admin.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Error sending email. Try again.' });
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    admin.password = req.body.password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    const token = signToken(admin._id);
    res.json({ success: true, token, message: 'Password reset successful.' });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id).select('+password');

    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

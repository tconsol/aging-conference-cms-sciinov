const Admin = require('../models/Admin');

exports.getAll = async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
    res.json({ success: true, data: admin });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const admin = await Admin.create({ name, email, password, role });
    res.status(201).json({
      success: true,
      data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    );
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
    res.json({ success: true, data: admin });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
    admin.password = req.body.newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password reset.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (req.params.id === req.admin.id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted.' });
  } catch (err) { next(err); }
};

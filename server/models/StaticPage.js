const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['about', 'guidelines', 'publication', 'terms'],
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StaticPage', staticPageSchema);

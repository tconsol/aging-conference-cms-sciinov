const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: String,
    coverImage: String,
    coverImagePublicId: String,
    fileUrl: String,
    filePublicId: String,
    isPublished: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

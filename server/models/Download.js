const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    type: {
      type: String,
      enum: ['template', 'flyer', 'pdf', 'brochure', 'other'],
      default: 'pdf',
    },
    fileUrl: { type: String, required: [true, 'File URL is required'] },
    filePublicId: String,
    thumbnail: String,
    thumbnailPublicId: String,
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Download', downloadSchema);

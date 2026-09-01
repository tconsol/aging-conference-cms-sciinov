const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    caption: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

galleryImageSchema.index({ edition: 1, displayOrder: 1 });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);

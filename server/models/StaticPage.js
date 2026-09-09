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
    // The About page has rendered a subtitle since it was written, but the field
    // never existed here, so the admin panel could not set one.
    subtitle: { type: String, default: '', trim: true },
    content: { type: String, default: '' },
    // Optional illustration, shown beside the page copy.
    image: String,
    imagePublicId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('StaticPage', staticPageSchema);

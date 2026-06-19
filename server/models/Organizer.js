const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    designation: { type: String, trim: true },
    bio: String,
    photo: String,
    photoPublicId: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organizer', organizerSchema);

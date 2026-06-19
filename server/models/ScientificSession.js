const mongoose = require('mongoose');

const scientificSessionSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: String,
    icon: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScientificSession', scientificSessionSchema);

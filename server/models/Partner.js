const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    logo: String,
    logoPublicId: String,
    website: { type: String, trim: true },
    type: {
      type: String,
      enum: ['partner', 'media_partner', 'sponsor'],
      default: 'partner',
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partner', partnerSchema);

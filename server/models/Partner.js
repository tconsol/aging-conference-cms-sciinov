const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    logo: String,
    logoPublicId: String,
    website: { type: String, trim: true },
    // Free-form so an admin can enter a type the three built-ins do not cover.
    // The admin panel offers partner / media_partner / sponsor plus "Other",
    // which writes whatever the admin typed. Kept as a plain trimmed string
    // rather than an enum for that reason.
    type: {
      type: String,
      default: 'partner',
      trim: true,
      maxlength: [60, 'Type cannot exceed 60 characters'],
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partner', partnerSchema);

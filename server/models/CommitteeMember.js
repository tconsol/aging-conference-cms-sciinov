const mongoose = require('mongoose');

const committeeMemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    designation: { type: String, trim: true },
    organization: { type: String, trim: true },
    country: { type: String, trim: true },
    biography: String,
    photo: String,
    photoPublicId: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommitteeMember', committeeMemberSchema);

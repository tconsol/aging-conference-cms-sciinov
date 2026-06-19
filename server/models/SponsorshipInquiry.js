const mongoose = require('mongoose');

const sponsorshipInquirySchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: [true, 'Organization name is required'], trim: true },
    contactPerson: { type: String, required: [true, 'Contact person is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required'],
    },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    website: { type: String, trim: true },
    message: String,
    status: {
      type: String,
      enum: ['new', 'read', 'follow_up', 'closed'],
      default: 'new',
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SponsorshipInquiry', sponsorshipInquirySchema);

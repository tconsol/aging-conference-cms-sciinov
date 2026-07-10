const mongoose = require('mongoose');

const speakerApplicationSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required'],
    },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    organization: { type: String, trim: true },
    designation: { type: String, trim: true },
    expertise: { type: String, trim: true },
    bio: String,
    message: String,
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SpeakerApplication', speakerApplicationSchema);

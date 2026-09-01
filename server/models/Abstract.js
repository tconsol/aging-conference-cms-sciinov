const mongoose = require('mongoose');

const abstractSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: [true, 'Edition is required'],
    },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required'],
    },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    organization: { type: String, trim: true },
    presentationType: {
      type: String,
      enum: ['oral_inperson', 'oral_virtual', 'poster_inperson', 'poster_virtual'],
      required: [true, 'Presentation type is required'],
    },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'ScientificSession' },
    topicText: String,
    abstractTitle: { type: String, required: [true, 'Abstract title is required'], trim: true },
    abstractText: { type: String, required: [true, 'Abstract text is required'], trim: true },
    keywords: { type: String, trim: true },
    coAuthors: { type: String, trim: true },
    fileUrl: String,
    filePublicId: String,
    fileName: String,

    // Letter of Acceptance, uploaded by an admin when the abstract is accepted.
    // Emailed to the author as an attachment and downloadable from their portal.
    acceptanceLetterUrl: String,
    acceptanceLetterPublicId: String,
    acceptanceLetterName: String,
    acceptanceLetterSentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'received_accepted', 'under_review', 'decision_pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    adminNotes: String,
    loginId: { type: String, sparse: true },
    loginPassword: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Abstract', abstractSchema);

const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const editionSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    year: { type: Number, required: [true, 'Year is required'] },
    theme: { type: String, trim: true },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    city: { type: String, required: [true, 'City is required'], trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    slug: { type: String, unique: true },
    status: {
      type: String,
      enum: ['active', 'upcoming', 'past'],
      default: 'upcoming',
    },
    isActive: { type: Boolean, default: false },
    bannerImage: String,
    bannerImagePublicId: String,
    description: String,
    highlights: [
      {
        label: String,
        value: String,
      },
    ],
    // Downloadable materials shown on the public "Past Events" card
    conferenceBook: {
      title: { type: String, trim: true, default: 'Conference Book' },
      coverImage: String,
      coverImagePublicId: String,
      fileUrl: String,
      filePublicId: String,
      fileName: String,
    },
    conferenceProgram: {
      title: { type: String, trim: true, default: 'Conference Program' },
      coverImage: String,
      coverImagePublicId: String,
      fileUrl: String,
      filePublicId: String,
      fileName: String,
    },
  },
  { timestamps: true }
);

editionSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(`${this.title}-${this.year}`);
  }
  next();
});

module.exports = mongoose.model('Edition', editionSchema);

const mongoose = require('mongoose');

// The three groupings the public page ships with. `category` is NOT an enum:
// an admin can type a new grouping and it renders as its own section, which is
// what "add extra ones if needed" requires.
const DEFAULT_CATEGORIES = ['sponsorship', 'exhibitor', 'other'];

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      default: 'sponsorship',
      maxlength: [60, 'Category cannot exceed 60 characters'],
    },
    // Free text rather than a number: tiers are quoted as "$25,000", "On request",
    // "From €5,000" and similar, and the page only ever prints the string.
    price: { type: String, trim: true, default: '' },
    priceNote: { type: String, trim: true, default: '' },
    perks: [{ type: String, trim: true }],
    // Renders the dark, raised card. Only meaningful for one per category.
    highlight: { type: Boolean, default: false },
    // Optional hex used for the tier name when not highlighted (e.g. Gold).
    accentColor: { type: String, trim: true, default: '' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

packageSchema.index({ category: 1, displayOrder: 1 });

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
module.exports.Package = Package;
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;

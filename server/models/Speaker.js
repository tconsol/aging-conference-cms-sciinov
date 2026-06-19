const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const speakerSchema = new mongoose.Schema(
  {
    editions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Edition' }],
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    slug: { type: String, unique: true },
    designation: { type: String, trim: true },
    organization: { type: String, trim: true },
    country: { type: String, trim: true },
    biography: String,
    photo: String,
    photoPublicId: String,
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

speakerSchema.pre('save', async function (next) {
  if (this.isModified('fullName') || !this.slug) {
    let base = slugify(this.fullName);
    let slug = base;
    let count = 1;
    while (await mongoose.model('Speaker').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Speaker', speakerSchema);

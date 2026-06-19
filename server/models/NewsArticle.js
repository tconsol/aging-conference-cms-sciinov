const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const newsArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true },
    featuredImage: String,
    featuredImagePublicId: String,
    content: { type: String, required: [true, 'Content is required'] },
    excerpt: String,
    tags: [{ type: String, trim: true }],
    author: { type: String, default: 'SMS congress Team', trim: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedAt: Date,
    scheduledAt: Date,
  },
  { timestamps: true }
);

newsArticleSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let base = slugify(this.title);
    let slug = base;
    let count = 1;
    while (await mongoose.model('NewsArticle').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('NewsArticle', newsArticleSchema);

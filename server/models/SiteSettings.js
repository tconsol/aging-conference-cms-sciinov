const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Aging congress', trim: true },
    tagline: { type: String, trim: true },
    logo: String,
    logoPublicId: String,
    favicon: String,
    faviconPublicId: String,
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    address: String,
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    seo: {
      title: String,
      description: String,
      keywords: String,
    },
    footerText: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

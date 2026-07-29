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
    theme: {
      primaryColor: { type: String, default: '#0d9488' },
      primaryDark:  { type: String, default: '#0f766e' },
      primaryLight: { type: String, default: '#f0fdfa' },
      accentColor:  { type: String, default: '#f59e0b' },
    },
    homepage: {
      hero: {
        tagline: { type: String, default: 'Registration Open' },
        titleLine1: { type: String, default: "The World's" },
        titleLine2: { type: String, default: 'Aging Science' },
        titleLine3: { type: String, default: 'congress.' },
        subtitle: { type: String },
        ctaPrimaryLabel: { type: String, default: 'Register Now' },
        ctaPrimaryLink: { type: String, default: '/registration' },
        ctaSecondaryLabel: { type: String, default: 'Submit Abstract' },
        ctaSecondaryLink: { type: String, default: '/abstract-submission' },
        countdownLabel: { type: String, default: 'Congress Begins In' },
      },
      stats: [{ label: String, value: String }],
      about: {
        sectionLabel: String,
        title: String,
        subtitle: String,
      },
      features: [{ icon: String, title: String, desc: String }],
      cta: {
        label: String,
        title: String,
        subtitle: String,
        primaryLabel: String,
        primaryLink: String,
        secondaryLabel: String,
        secondaryLink: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

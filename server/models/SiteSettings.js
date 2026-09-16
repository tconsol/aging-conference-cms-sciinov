const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    // Optional on purpose: with no site name the header shows the logo alone.
    // No `default` — a default would reappear every time an admin cleared it.
    siteName: { type: String, default: '', trim: true },
    // Google Font family applied to the site name in the header, e.g. "Poppins".
    // Empty means the theme's own font stack.
    siteNameFont: { type: String, default: '', trim: true },
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
    // Rich text shown below the organizer profiles on the public organizers page.
    // Was being sent by the admin panel long before it existed here, and Mongoose
    // silently dropped it on every save — which is why edits never appeared.
    organizerPageContent: { type: String, default: '' },
    // Sample abstract template, offered as a download on the submission page.
    sampleAbstractUrl: String,
    sampleAbstractPublicId: String,
    sampleAbstractName: String,
    // Per-page and per-section show/hide switches, keyed by the ids in
    // config/visibilityRegistry.js. A key that is absent means "visible" — the
    // public site only hides on an explicit `false`, so adding a new page to
    // the registry never hides it retroactively.
    visibility: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    // Structured content for the public About page. Mirrors how `homepage`
    // below holds the homepage CMS, so both pages are edited the same way.
    // `icon` stores a lucide icon name, resolved to a component on the client.
    aboutPage: {
      stats:    [{ value: String, label: String }],
      values:   [{ icon: String, label: String, title: String, desc: String }],
      benefits: [String],
      audience: [{ icon: String, title: String, desc: String }],
    },
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

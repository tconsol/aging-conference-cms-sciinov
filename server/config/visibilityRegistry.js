/**
 * Everything on the public site that an admin can show or hide, plus how to
 * count what each one currently holds.
 *
 * The registry lives on the server so the admin panel renders straight from the
 * API — adding a new toggle means editing this file only, not three codebases.
 * The client guards on `key`; it does not need labels or counts.
 *
 * `count` is optional. When present it returns the number of live items behind
 * the entry, which drives both the "4 active items" hint in the admin panel and
 * the automatic hiding of empty sections on the public site.
 */

const models = {
  Speaker:          () => require('../models/Speaker'),
  CommitteeMember:  () => require('../models/CommitteeMember'),
  Organizer:        () => require('../models/Organizer'),
  ScientificSession:() => require('../models/ScientificSession'),
  ProgramSlot:      () => require('../models/ProgramSlot'),
  ImportantDate:    () => require('../models/ImportantDate'),
  Venue:            () => require('../models/Venue'),
  NewsArticle:      () => require('../models/NewsArticle'),
  Report:           () => require('../models/Report'),
  Download:         () => require('../models/Download'),
  Testimonial:      () => require('../models/Testimonial'),
  Partner:          () => require('../models/Partner'),
  Package:          () => require('../models/Package'),
  Brochure:         () => require('../models/Brochure'),
  PricingTier:      () => require('../models/PricingTier'),
  Edition:          () => require('../models/Edition'),
  FAQ:              () => require('../models/FAQ'),
  StaticPage:       () => require('../models/StaticPage'),
  SiteSettings:     () => require('../models/SiteSettings'),
  GalleryImage:     () => require('../models/GalleryImage'),
};

const SAMPLE_LIMIT = 5;

/**
 * Each entry returns `{ count, items }` from a single query: the number behind
 * the switch, and a short list of what is actually there. The admin panel shows
 * those items so hiding something is a decision about real content rather than
 * an abstract count.
 */
const countActive = (name, filter = {}, labelFields = ['name', 'title', 'label']) => async () => {
  const Model = models[name]();
  const [count, docs] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).limit(SAMPLE_LIMIT).lean(),
  ]);
  const items = docs.map((d) => {
    for (const f of labelFields) {
      if (d[f]) return String(d[f]);
    }
    // Some collections (gallery images, program slots) have no obvious label.
    return d.caption || d.heading || d.email || d.city || `Item ${String(d._id).slice(-6)}`;
  });
  return { count, items };
};

// Non-empty rich text on a static page: the sample is the opening sentence.
const countPageContent = (key) => async () => {
  const page = await models.StaticPage().findOne({ key });
  const text = (page?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return { count: 0, items: [] };
  return { count: 1, items: [text.length > 160 ? `${text.slice(0, 160)}…` : text] };
};

// An array held on SiteSettings, e.g. aboutPage.values.
const countSettingsArray = (path) => async () => {
  const settings = await models.SiteSettings().findOne();
  const arr = path.split('.').reduce((acc, k) => acc?.[k], settings?.toObject?.() || settings);
  if (!Array.isArray(arr)) return { count: 0, items: [] };
  const items = arr.slice(0, SAMPLE_LIMIT).map((v) => {
    if (typeof v === 'string') return v;
    // Stats read best as "1,200+ — Annual Attendees"; everything else by title.
    if (v?.value && v?.label) return `${v.value} — ${v.label}`;
    return v?.title || v?.label || v?.name || JSON.stringify(v).slice(0, 60);
  });
  return { count: arr.length, items };
};

const PAGES = [
  { key: 'about',            label: 'About',                 path: '/about',               description: 'Mission, values, benefits and audience.', count: countPageContent('about') },
  { key: 'speakers',         label: 'Speakers',              path: '/speakers',            description: 'Speaker profiles grid.',                  count: countActive('Speaker', { isActive: true }) },
  { key: 'committee',        label: 'Scientific Committee',  path: '/committee',           description: 'Committee member profiles.',              count: countActive('CommitteeMember', { isActive: true }) },
  { key: 'organizers',       label: 'Organizers',            path: '/organizers',          description: 'Organizer profiles and page copy.',       count: countActive('Organizer', { isActive: true }) },
  { key: 'sessions',         label: 'Scientific Sessions',   path: '/sessions',            description: 'Session topics list.',                    count: countActive('ScientificSession', { isActive: true }) },
  { key: 'program',          label: 'Scientific Program',    path: '/program',             description: 'Day-by-day schedule.',                    count: countActive('ProgramSlot') },
  { key: 'importantDates',   label: 'Important Dates',       path: '/important-dates',     description: 'Deadline timeline.',                      count: countActive('ImportantDate') },
  { key: 'venue',            label: 'Venue & Hospitality',   path: '/venue',               description: 'Venue details and map.',                  count: countActive('Venue') },
  { key: 'pricing',          label: 'Pricing',               path: '/pricing',             description: 'Registration pricing tiers.',             count: countActive('PricingTier', { isActive: true }) },
  { key: 'registration',     label: 'Registration',          path: '/registration',        description: 'Registration and payment form.' },
  { key: 'abstractSubmission', label: 'Submit Abstract',     path: '/abstract-submission', description: 'Abstract submission form.' },
  { key: 'news',             label: 'News / Blog',           path: '/news',                description: 'Published articles.',                     count: countActive('NewsArticle', { status: 'published' }) },
  { key: 'reports',          label: 'Reports',               path: '/reports',             description: 'Published research reports.',             count: countActive('Report', { isPublished: true }) },
  { key: 'downloads',        label: 'Quick Downloads',       path: '/downloads',           description: 'Downloadable resources.',                 count: countActive('Download', { isActive: true }) },
  { key: 'brochure',         label: 'Brochure',              path: '/brochure',            description: 'Congress brochure download.',             count: countActive('Brochure') },
  { key: 'testimonials',     label: 'Testimonials',          path: '/testimonials',        description: 'Attendee quotes.',                        count: countActive('Testimonial', { isActive: true }) },
  { key: 'partners',         label: 'Partners',              path: '/partners',            description: 'Partner and sponsor logos.',              count: countActive('Partner', { isActive: true }) },
  { key: 'sponsorship',      label: 'Sponsor / Exhibit',     path: '/sponsorship',         description: 'Packages and inquiry form.',              count: countActive('Package', { isActive: true }) },
  { key: 'becomeASpeaker',   label: 'Become a Speaker',      path: '/become-a-speaker',    description: 'Speaker application form.' },
  { key: 'editions',         label: 'Past Events',           path: '/editions',            description: 'Previous congress editions.',             count: countActive('Edition') },
  { key: 'gallery',          label: 'Gallery',               path: '/editions',            description: 'Edition photo galleries.',                count: countActive('GalleryImage') },
  { key: 'help',             label: 'Help & Support',        path: '/help',                description: 'FAQs and support.',                       count: countActive('FAQ', { isActive: true }) },
  { key: 'contact',          label: 'Contact',               path: '/contact',             description: 'Contact form and details.' },
  { key: 'newsletter',       label: 'Newsletter',            path: '/newsletter',          description: 'Newsletter signup page.' },
  { key: 'guidelines',       label: 'Presentation Guidelines', path: '/guidelines',        description: 'Static guidelines page.',                 count: countPageContent('guidelines') },
  { key: 'publication',      label: 'Publication Policy',    path: '/publication-policy',  description: 'Static publication page.',                count: countPageContent('publication') },
  { key: 'terms',            label: 'Terms & Conditions',    path: '/terms',               description: 'Static terms page.',                      count: countPageContent('terms') },
];

// No 'home-features' or 'home-partners' entries: the features grid is one column
// of the home About section (hiding it alone would leave a half-empty layout, and
// 'home-about' already covers it), and the homepage has no partners section at all.
const SECTIONS = [
  { key: 'home-stats',        label: 'Home — Stats band',        page: 'Home',  description: 'Headline numbers under the hero.',        count: countSettingsArray('homepage.stats') },
  { key: 'home-about',        label: 'Home — About blurb',       page: 'Home',  description: 'Short intro section.' },
  { key: 'home-speakers',     label: 'Home — Featured speakers', page: 'Home',  description: 'Speaker highlights carousel.',            count: countActive('Speaker', { isActive: true, isFeatured: true }) },
  { key: 'home-testimonials', label: 'Home — Testimonials',      page: 'Home',  description: 'Quotes carousel.',                        count: countActive('Testimonial', { isActive: true }) },
  { key: 'home-news',         label: 'Home — Latest news',       page: 'Home',  description: 'Most recent articles.',                   count: countActive('NewsArticle', { status: 'published' }) },
  { key: 'home-dates',        label: 'Home — Important dates',   page: 'Home',  description: 'Deadline strip.',                         count: countActive('ImportantDate') },
  { key: 'home-cta',          label: 'Home — Closing CTA',       page: 'Home',  description: 'Register / submit call to action.' },
  { key: 'about-image',       label: 'About — Page image',       page: 'About', description: 'Illustration beside the mission text.' },
  { key: 'about-stats',       label: 'About — Stats band',       page: 'About', description: 'Counting numbers band.',                  count: countSettingsArray('aboutPage.stats') },
  { key: 'about-values',      label: 'About — Our Values',       page: 'About', description: 'Icon grid of values.',                    count: countSettingsArray('aboutPage.values') },
  { key: 'about-benefits',    label: 'About — Why Attend',       page: 'About', description: 'Ticked benefits list.',                   count: countSettingsArray('aboutPage.benefits') },
  { key: 'about-audience',    label: 'About — Audience',         page: 'About', description: 'Who should attend.',                      count: countSettingsArray('aboutPage.audience') },
];

const ALL = [
  ...PAGES.map((p) => ({ ...p, type: 'page' })),
  ...SECTIONS.map((s) => ({ ...s, type: 'section' })),
];

const KEYS = ALL.map((e) => e.key);

module.exports = { PAGES, SECTIONS, ALL, KEYS };

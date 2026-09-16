/**
 * Writes client/public/sitemap.xml from the live database.
 *
 *   npm run seo:sitemap
 *
 * Generated at build time rather than served from the API: the file has to live
 * at the site's own origin (search engines distrust a sitemap hosted elsewhere),
 * and the public site is static hosting, not this server.
 *
 * Re-run it after adding pages, speakers, sessions, news or reports — otherwise
 * search engines keep crawling the previous set.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const SiteSettings = require('../models/SiteSettings');
const { PAGES } = require('../config/visibilityRegistry');

const SITE_URL = (process.env.SITE_URL || 'https://globalagingcongress.com').replace(/\/$/, '');
const OUT = path.join(__dirname, '../../client/public/sitemap.xml');

// Routes with no registry entry of their own.
const EXTRA_ROUTES = [{ path: '/', priority: '1.0', changefreq: 'weekly' }];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const url = ({ path: p, lastmod, changefreq = 'monthly', priority = '0.6' }) => [
  '  <url>',
  `    <loc>${esc(SITE_URL + p)}</loc>`,
  lastmod ? `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : null,
  `    <changefreq>${changefreq}</changefreq>`,
  `    <priority>${priority}</priority>`,
  '  </url>',
].filter(Boolean).join('\n');

async function detailRoutes() {
  const out = [];
  const safe = async (fn) => { try { return await fn(); } catch { return []; } };

  const speakers = await safe(() => require('../models/Speaker')
    .find({ isActive: true }).select('slug updatedAt').lean());
  speakers.forEach((s) => s.slug && out.push({ path: `/speakers/${s.slug}`, lastmod: s.updatedAt, priority: '0.5' }));

  const news = await safe(() => require('../models/NewsArticle')
    .find({ status: 'published' }).select('slug updatedAt').lean());
  news.forEach((n) => n.slug && out.push({ path: `/news/${n.slug}`, lastmod: n.updatedAt, changefreq: 'weekly', priority: '0.6' }));

  const sessions = await safe(() => require('../models/ScientificSession')
    .find({ isActive: true }).select('_id updatedAt').lean());
  sessions.forEach((s) => out.push({ path: `/sessions/${s._id}`, lastmod: s.updatedAt, priority: '0.5' }));

  const reports = await safe(() => require('../models/Report')
    .find({ isPublished: true }).select('_id updatedAt').lean());
  reports.forEach((r) => out.push({ path: `/reports/${r._id}`, lastmod: r.updatedAt, priority: '0.5' }));

  const editions = await safe(() => require('../models/Edition')
    .find().select('_id updatedAt').lean());
  editions.forEach((e) => out.push({ path: `/editions/${e._id}`, lastmod: e.updatedAt, priority: '0.4' }));

  return out;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const settings = await SiteSettings.findOne();
  const visibility = settings?.visibility
    ? (settings.visibility instanceof Map ? Object.fromEntries(settings.visibility) : settings.visibility)
    : {};

  // A page the admin switched off is served with noindex, so listing it in the
  // sitemap would be telling search engines to crawl something we then refuse.
  const visiblePages = PAGES.filter((p) => visibility[p.key] !== false && p.path);

  const seen = new Set();
  const routes = [
    ...EXTRA_ROUTES,
    ...visiblePages.map((p) => ({ path: p.path, priority: '0.8' })),
    ...(await detailRoutes()),
  ].filter((r) => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map(url),
    '</urlset>',
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, xml, 'utf8');

  const hidden = PAGES.length - visiblePages.length;
  console.log(`Sitemap written: ${OUT}`);
  console.log(`  ${routes.length} URLs · base ${SITE_URL}`);
  if (hidden) console.log(`  ${hidden} page(s) omitted because they are hidden in the admin panel`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Sitemap error:', err.message);
  process.exit(1);
});

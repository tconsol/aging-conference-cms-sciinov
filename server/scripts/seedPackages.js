/**
 * Seeds sponsorship, exhibitor and other packages for the public sponsorship
 * page. The sponsorship tiers carry over the four that used to be hardcoded in
 * client/src/pages/Sponsorship.jsx; the exhibitor and other groupings are new.
 *
 *   npm run seed:packages            # skips packages that already exist by name+category
 *   npm run seed:packages -- --force # deletes every seeded package first, then re-creates
 *
 * Prices are free text, so "On request" is as valid as "$25,000".
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Package = require('../models/Package');

const PACKAGES = [
  // ── Sponsorship ──────────────────────────────────────────────────────────
  {
    name: 'Platinum', category: 'sponsorship', price: '$25,000', priceNote: '/ edition',
    highlight: true, displayOrder: 1,
    perks: [
      'Premier logo on all congress materials',
      'Keynote session naming rights',
      'Exhibition booth prime location (20×20 ft)',
      '8 complimentary full registrations',
      'Full-page ad in congress proceedings',
      'Exclusive VIP dinner invitation (4 guests)',
      'Dedicated social media campaign',
      'Post-congress attendee summary report',
    ],
  },
  {
    name: 'Gold', category: 'sponsorship', price: '$15,000', priceNote: '/ edition',
    accentColor: '#b45309', displayOrder: 2,
    perks: [
      'Logo on all congress materials',
      'Exhibition booth standard location (10×10 ft)',
      '5 complimentary full registrations',
      'Speaking opportunity (10 min)',
      'Full-page ad in congress proceedings',
      'Social media recognition package',
    ],
  },
  {
    name: 'Silver', category: 'sponsorship', price: '$8,000', priceNote: '/ edition',
    accentColor: '#475569', displayOrder: 3,
    perks: [
      'Logo on website and event signage',
      'Exhibition table (6 ft)',
      '3 complimentary registrations',
      'Half-page ad in proceedings',
      'Social media mention',
    ],
  },
  {
    name: 'Bronze', category: 'sponsorship', price: '$3,500', priceNote: '/ edition',
    accentColor: '#9a5121', displayOrder: 4,
    perks: [
      'Logo on congress website',
      '2 complimentary registrations',
      'Quarter-page ad in proceedings',
      'Social media mention',
    ],
  },

  // ── Exhibitor ────────────────────────────────────────────────────────────
  {
    name: 'Premium Booth', category: 'exhibitor', price: '$6,500', priceNote: '/ edition',
    highlight: true, displayOrder: 1,
    perks: [
      'Prime corner booth (10×10 ft) near the main hall',
      '4 exhibitor badges with full session access',
      'Company profile in the congress app and proceedings',
      'Logo on the exhibition floor plan and signage',
      'Pre-congress delegate list (opt-in contacts only)',
      'Priority booth selection for the next edition',
    ],
  },
  {
    name: 'Standard Booth', category: 'exhibitor', price: '$4,000', priceNote: '/ edition',
    accentColor: '#0f766e', displayOrder: 2,
    perks: [
      'Standard booth space (10×10 ft)',
      '2 exhibitor badges with full session access',
      'Company profile in the congress app',
      'Logo on the exhibition floor plan',
      'Lead retrieval access',
    ],
  },
  {
    name: 'Table Top', category: 'exhibitor', price: '$2,200', priceNote: '/ edition',
    accentColor: '#475569', displayOrder: 3,
    perks: [
      'Draped table display (6 ft) with two chairs',
      '1 exhibitor badge with full session access',
      'Company listing in the congress app',
      'Access to networking breaks in the exhibition hall',
    ],
  },
  {
    name: 'Startup Pod', category: 'exhibitor', price: '$1,200', priceNote: '/ edition',
    accentColor: '#7c3aed', displayOrder: 4,
    perks: [
      'Shared startup zone pod',
      '1 exhibitor badge',
      'Listing in the startup showcase',
      'Eligible for the innovation pitch session',
    ],
  },

  // ── Other ────────────────────────────────────────────────────────────────
  {
    name: 'Workshop Host', category: 'other', price: '$5,000', priceNote: '/ session',
    highlight: true, displayOrder: 1,
    perks: [
      '90-minute branded workshop slot',
      'Room setup, AV and technical support included',
      'Workshop listed in the official programme',
      'Attendee list for the session (opt-in contacts only)',
      '2 complimentary registrations',
    ],
  },
  {
    name: 'Networking Reception', category: 'other', price: '$7,500', priceNote: '/ edition',
    accentColor: '#b45309', displayOrder: 2,
    perks: [
      'Naming rights for the evening reception',
      'Branded signage and table cards throughout the venue',
      '3-minute welcome address to all attendees',
      'Logo on reception invitations',
      '4 complimentary registrations',
    ],
  },
  {
    name: 'Delegate Bag Insert', category: 'other', price: '$1,500', priceNote: '/ edition',
    accentColor: '#475569', displayOrder: 3,
    perks: [
      'One insert or branded item in every delegate bag',
      'Logo on the bag insert listing',
      'Distribution to all in-person attendees',
    ],
  },
  {
    name: 'Custom Package', category: 'other', price: 'On request', priceNote: '',
    accentColor: '#0f766e', displayOrder: 4,
    perks: [
      'Built around your objectives and budget',
      'Mix and match any sponsorship or exhibitor benefits',
      'Multi-edition and multi-year options available',
      'Contact the partnerships team to discuss',
    ],
  },
];

const force = process.argv.includes('--force');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  if (force) {
    // Scoped to the names this script owns, so packages an admin added by hand
    // are never deleted by a re-run.
    const names = PACKAGES.map((p) => p.name);
    const { deletedCount } = await Package.deleteMany({
      name: { $in: names },
      category: { $in: [...new Set(PACKAGES.map((p) => p.category))] },
    });
    console.log(`--force: removed ${deletedCount} existing seeded package(s)`);
  }

  let created = 0;
  let skipped = 0;
  for (const pkg of PACKAGES) {
    const exists = await Package.findOne({ name: pkg.name, category: pkg.category });
    if (exists) {
      skipped += 1;
      continue;
    }
    await Package.create(pkg);
    created += 1;
  }

  console.log(`Created ${created} package(s), skipped ${skipped} already present.`);
  for (const category of [...new Set(PACKAGES.map((p) => p.category))]) {
    const n = await Package.countDocuments({ category });
    console.log(`  ${category.padEnd(12)} ${n} total in database`);
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});

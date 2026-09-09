/**
 * Seeds the About page sections with the content that used to be hardcoded in
 * client/src/pages/About.jsx, so the page keeps looking identical once it starts
 * reading from the database.
 *
 *   npm run seed:about            # only fills sections that are empty
 *   npm run seed:about -- --force # overwrites whatever is stored
 *
 * `icon` values are lucide icon names; the client maps them to components and
 * falls back to a neutral icon for anything it does not recognise.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const SiteSettings = require('../models/SiteSettings');

const STATS = [
  { value: '15+',    label: 'Years of Excellence' },
  { value: '45+',    label: 'Countries Represented' },
  { value: '1,200+', label: 'Annual Attendees' },
  { value: '500+',   label: 'Research Papers' },
];

const VALUES = [
  { icon: 'Target',   label: '01', title: 'Scientific Excellence', desc: 'Rigorous peer-reviewed research and evidence-based discussions at every session.' },
  { icon: 'Globe',    label: '02', title: 'Global Collaboration',  desc: 'Fostering international partnerships across research institutions worldwide.' },
  { icon: 'Heart',    label: '03', title: 'Patient Impact',        desc: 'Translating research insights into real-world health benefits.' },
  { icon: 'BookOpen', label: '04', title: 'Knowledge Exchange',    desc: 'Open sharing of findings to accelerate discovery across disciplines.' },
  { icon: 'Users',    label: '05', title: 'Inclusive Community',   desc: 'Welcoming researchers, clinicians, and students at all career stages.' },
  { icon: 'Award',    label: '06', title: 'Innovation First',      desc: 'Championing novel approaches and emerging technologies in aging science.' },
];

const BENEFITS = [
  'Cutting-edge, peer-reviewed research in geroscience and aging biology',
  'Keynotes from world-leading researchers and Nobel laureates',
  'Networking with global peers and collaborators across disciplines',
  'Present your own research through oral and poster sessions',
  'Certificate of participation and continuing education credit',
  'Exposure to latest tools, technologies, and funding opportunities',
];

const AUDIENCE = [
  { icon: 'Microscope',    title: 'Researchers & Scientists',   desc: 'Molecular biologists, geroscientists, academic researchers.' },
  { icon: 'Stethoscope',   title: 'Clinicians & Geriatricians', desc: 'Physicians and healthcare providers in aging and elderly care.' },
  { icon: 'GraduationCap', title: 'Students & Early-Career',    desc: 'PhD candidates and postdocs building a career in aging research.' },
  { icon: 'Briefcase',     title: 'Industry & Pharma',          desc: 'R&D teams working on longevity and age-related therapeutics.' },
  { icon: 'Landmark',      title: 'Policy Makers',              desc: 'Public health leaders shaping aging-related policy and care systems.' },
];

const force = process.argv.includes('--force');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});

  const current = settings.aboutPage || {};
  const sections = {
    stats:    { seed: STATS,    existing: current.stats },
    values:   { seed: VALUES,   existing: current.values },
    benefits: { seed: BENEFITS, existing: current.benefits },
    audience: { seed: AUDIENCE, existing: current.audience },
  };

  const next = {};
  for (const [name, { seed: seedData, existing }] of Object.entries(sections)) {
    const has = Array.isArray(existing) && existing.length > 0;
    if (has && !force) {
      console.log(`  ${name.padEnd(9)} kept (${existing.length} existing entries) — use --force to overwrite`);
      next[name] = existing;
    } else {
      console.log(`  ${name.padEnd(9)} seeded with ${seedData.length} entries`);
      next[name] = seedData;
    }
  }

  await SiteSettings.findByIdAndUpdate(settings._id, { $set: { aboutPage: next } });
  console.log('About page sections saved.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});

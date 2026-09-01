/* node server/scripts/seedPricingTiers.js
   Seeds / upserts all 3 pricing tiers for the most-recent active edition.
   Safe to re-run uses upsert so won't duplicate.
*/
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Edition     = require('../models/Edition');
const PricingTier = require('../models/PricingTier');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find the active / most recent edition
  let edition = await Edition.findOne({ status: 'active' }).sort({ year: -1 });
  if (!edition) edition = await Edition.findOne().sort({ year: -1 });
  if (!edition) { console.error('No edition found. Create one in admin first.'); process.exit(1); }
  console.log(`Seeding tiers for edition: ${edition.title} (${edition.year})`);

  const tiers = [
    {
      name: 'early_bird',
      label: 'Early Bird',
      deadline: new Date('2026-09-04'),
      isActive: true,
      displayOrder: 1,
      prices: {
        oral_inperson:    699,
        oral_virtual:     499,
        poster_inperson:  599,
        poster_virtual:   349,
        listener_inperson:799,
        listener_virtual: 199,
        student:          299,
      },
    },
    {
      name: 'mid_term',
      label: 'Mid Term',
      deadline: new Date('2026-11-28'),
      isActive: false,
      displayOrder: 2,
      prices: {
        oral_inperson:    799,
        oral_virtual:     599,
        poster_inperson:  699,
        poster_virtual:   449,
        listener_inperson:899,
        listener_virtual: 399,
        student:          499,
      },
    },
    {
      name: 'on_spot',
      label: 'On Spot',
      deadline: new Date('2027-03-09'),
      isActive: false,
      displayOrder: 3,
      prices: {
        oral_inperson:    899,
        oral_virtual:     699,
        poster_inperson:  799,
        poster_virtual:   549,
        listener_inperson:999,
        listener_virtual: 499,
        student:          599,
      },
    },
  ];

  for (const tier of tiers) {
    const result = await PricingTier.findOneAndUpdate(
      { edition: edition._id, name: tier.name },
      { ...tier, edition: edition._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✓ ${tier.label} oral in-person $${tier.prices.oral_inperson}`);
  }

  console.log('\nDone. All 3 pricing tiers seeded.');
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });

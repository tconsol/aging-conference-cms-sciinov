/* eslint-disable no-console */
// One-off data-repair script: an earlier Edition ("7th International Aging
// congress", 2025) was deleted from the admin panel without cascading the
// deletion to its child records (ScientificSession, PricingTier,
// ImportantDate, Brochure). Those records were left pointing at an Edition
// id that no longer exists, so the client which always filters by the
// current active edition was rendering them as empty/"Coming Soon".
//
// This script re-attaches the still-relevant orphaned records to the
// current active edition, shifting their 2025 dates to sensible 2026
// equivalents around the real congress dates. It does not touch the
// Brochure (its fileUrl is a fake seed placeholder, not a real uploaded
// file) or the two junk "test"-labelled ImportantDate rows.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Edition          = require('../models/Edition');
const ScientificSession = require('../models/ScientificSession');
const PricingTier      = require('../models/PricingTier');
const ImportantDate    = require('../models/ImportantDate');

const ORPHAN_EDITION_ID = '6a3a27643700f989b4f482f2';

const log = (msg) => console.log(`  ✓ ${msg}`);
const section = (msg) => console.log(`\n► ${msg}`);

async function main() {
  console.log('\n══════════════════════════════════════════');
  console.log('  Fix orphaned edition data  ');
  console.log('══════════════════════════════════════════');

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('\nConnected to MongoDB:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));

  const edition = await Edition.findOne({ isActive: true });
  if (!edition) {
    console.error('No active edition found. Aborting.');
    process.exit(1);
  }
  console.log(`Active edition: "${edition.title}" (${edition._id}), ${edition.startDate.toDateString()} - ${edition.endDate.toDateString()}`);

  section('Re-attaching scientific sessions...');
  const sessionResult = await ScientificSession.updateMany(
    { edition: ORPHAN_EDITION_ID },
    { $set: { edition: edition._id } }
  );
  log(`${sessionResult.modifiedCount} sessions re-attached`);

  section('Re-attaching + re-dating pricing tiers...');
  await PricingTier.updateOne(
    { edition: ORPHAN_EDITION_ID, name: 'early_bird' },
    { $set: { edition: edition._id, deadline: new Date('2026-06-30') } }
  );
  await PricingTier.updateOne(
    { edition: ORPHAN_EDITION_ID, name: 'mid_term' },
    { $set: { edition: edition._id, deadline: new Date('2026-07-20') } }
  );
  log('early_bird deadline -> 2026-06-30, mid_term deadline -> 2026-07-20');

  section('Re-attaching + re-dating important dates...');
  const dateUpdates = [
    { label: 'Abstract Submission Deadline',     newDate: new Date('2026-06-01') },
    { label: 'Early Bird Registration Deadline', newDate: new Date('2026-06-30') },
    { label: 'Notification of Acceptance',       newDate: new Date('2026-06-15') },
    { label: 'Camera-Ready Submission',          newDate: new Date('2026-07-10') },
    { label: 'Mid-Term Registration Deadline',   newDate: new Date('2026-07-20') },
    { label: 'Pre-congress Workshops',           newLabel: 'Pre-Congress Workshops', newDate: new Date('2026-07-31') },
    { label: 'congress Opening Day',              newLabel: 'Congress Opening Day',   newDate: new Date('2026-08-01') },
    { label: 'On-Site Registration Closes',       newDate: new Date('2026-08-01') },
    { label: 'congress Closing Day',              newLabel: 'Congress Closing Day',   newDate: new Date('2026-08-05') },
  ];
  let dateCount = 0;
  for (const { label, newLabel, newDate } of dateUpdates) {
    const update = { edition: edition._id, date: newDate };
    if (newLabel) update.label = newLabel;
    const res = await ImportantDate.updateOne({ edition: ORPHAN_EDITION_ID, label }, { $set: update });
    if (res.modifiedCount > 0) dateCount += 1;
  }
  log(`${dateCount} important dates re-attached and re-dated for the 2026 congress`);

  console.log('\n══════════════════════════════════════════');
  console.log('  Done. Brochure and 2 "test" ImportantDate rows left untouched');
  console.log('  (brochure file URL is fake placeholder data needs a real upload via admin).');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nFix failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});

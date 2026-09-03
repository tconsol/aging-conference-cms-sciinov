/**
 * Creates or updates the super admin account.
 *
 * Credentials come from the environment or from flags — never from this file,
 * so rotating them does not mean editing (and committing) source.
 *
 *   npm run seed:admin                      # uses SEED_ADMIN_* from server/.env
 *   node scripts/seedAdmin.js --email=a@b.c --password='...' --name='...'
 *   node scripts/seedAdmin.js --force       # reset the password of an existing account
 *
 * Without --force an existing account is left untouched.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const flag = (key) => {
  const hit = process.argv.find((a) => a.startsWith(`--${key}=`));
  return hit ? hit.slice(key.length + 3) : undefined;
};

const email = (flag('email') || process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
const password = flag('password') || process.env.SEED_ADMIN_PASSWORD || '';
const name = flag('name') || process.env.SEED_ADMIN_NAME || 'Super Admin';
const force = process.argv.includes('--force');

async function seed() {
  if (!email || !password) {
    console.error('Missing credentials.');
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in server/.env,');
    console.error("or pass --email=… --password='…'.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters (the Admin model rejects shorter).');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // .select('+password') because the field is select:false — without it, save()
  // would fail the "Password is required" validator on an existing document.
  const existing = await Admin.findOne({ email }).select('+password');

  if (existing && !force) {
    console.log(`Admin ${email} already exists. Re-run with --force to reset its password.`);
    process.exit(0);
  }

  if (existing) {
    existing.name = name;
    existing.password = password; // pre('save') hashes it
    existing.role = 'super_admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Updated existing admin: ${email} (role super_admin, active)`);
  } else {
    await Admin.create({ name, email, password, role: 'super_admin' });
    console.log(`Created super admin: ${email}`);
  }

  // The password is deliberately not echoed — whoever ran this already has it.
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});

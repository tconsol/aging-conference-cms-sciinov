require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ email: 'admin@agingcongress.com' });
  if (existing) {
    console.log('Super admin already exists. Skipping.');
    process.exit(0);
  }

  await Admin.create({
    name: 'Super Admin',
    email: 'admin@agingcongress.com',
    password: 'Admin@123456',
    role: 'super_admin',
  });

  console.log('');
  console.log('Super admin created:');
  console.log('  Email:    admin@agingcongress.com');
  console.log('  Password: Admin@123456');
  console.log('');
  console.log('IMPORTANT: Change the password after first login.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});

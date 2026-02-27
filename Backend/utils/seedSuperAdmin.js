const User = require('../models/User');

const seedSuperAdmin = async () => {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.log('SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD not set — skipping seed.');
    return;
  }

  try {
    const existing = await User.findOne({ email });

    if (existing) {
      // User already exists — ensure they have the superadmin role
      if (existing.role !== 'superadmin') {
        existing.role = 'superadmin';
        await existing.save();
        console.log(`Super admin role updated for existing user: ${email}`);
      }
      return;
    }

    await User.create({ name, email, password, role: 'superadmin' });
    console.log(`Super admin seeded: ${email}`);
  } catch (err) {
    console.error('Super admin seed failed:', err.message);
  }
};

module.exports = seedSuperAdmin;

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
      // Always sync name, role, and password from .env on every restart
      existing.role = 'superadmin';
      existing.name = name;
      existing.password = password; // pre-save hook will hash it
      await existing.save();
      console.log(`Super admin synced from .env: ${email}`);
    } else {
      await User.create({ name, email, password, role: 'superadmin' });
      console.log(`Super admin created: ${email}`);
    }
  } catch (err) {
    console.error('Super admin seed failed:', err.message);
  }
};

module.exports = seedSuperAdmin;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin';

// Load environment variables
dotenv.config();

// Prevent accidental seeding in shared environments
if (process.env.ALLOW_SEED !== 'true') {
  console.log('[Seed] Seeding is disabled by default for security reasons.');
  console.log("[Seed] To enable seeding, set environment variable ALLOW_SEED=true and run the seed script.");
  console.log("[Seed] Example (Unix): ALLOW_SEED=true npm run seed-admin");
  console.log("[Seed] Example (PowerShell): $env:ALLOW_SEED='true'; npm run seed-admin");
  process.exit(0);
}
/**
 * Seed Initial Admin User
 * Run: npm run seed-admin
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/voice-agent';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Check if any admin exists
    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      console.log('[Seed] Admin user already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Name: ${existingAdmin.name}`);
      console.log(`  Role: ${existingAdmin.role}`);
      console.log('\n[Seed] Skipping seed. Use change-password API to update password.');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      email: 'admin@restaurant.com',
      password: 'admin123', // Will be hashed automatically
      name: 'Admin User',
      role: 'super-admin',
      isActive: true
    });

    await admin.save();

    console.log('\n[Seed] ✓ Admin user created successfully!');
    console.log('\n========================================');
    console.log('Default Admin Credentials:');
    console.log('========================================');
    console.log('Email:    admin@restaurant.com');
    console.log('Password: admin123');
    console.log('Role:     super-admin');
    console.log('========================================');
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('Use the /api/admin/auth/change-password endpoint\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();

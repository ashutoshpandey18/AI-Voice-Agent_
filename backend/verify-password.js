require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function verifyPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voice-agent');

    const AdminModel = mongoose.model('Admin', new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      role: String,
      isActive: Boolean
    }, { timestamps: true }));

    const admin = await AdminModel.findOne({ email: 'admin@restaurant.com' });

    if (!admin) {
      console.log('❌ Admin not found!');
      process.exit(1);
    }

    console.log('✓ Admin found:', admin.email);
    console.log('  Name:', admin.name);
    console.log('  Role:', admin.role);
    console.log('  Active:', admin.isActive);

    // Test password
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('\n🔑 Password test:');
    console.log('  Password "admin123" matches:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n⚠️ Password mismatch! Recreating admin...');
      await AdminModel.deleteMany({});

      const hashedPassword = await bcrypt.hash('admin123', 10);
      await AdminModel.create({
        email: 'admin@restaurant.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'super-admin',
        isActive: true
      });

      console.log('✅ Admin recreated with correct password!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verifyPassword();

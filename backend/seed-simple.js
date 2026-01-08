require('dotenv').config();
const mongoose = require('mongoose');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/voice-agent';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const AdminModel = mongoose.model('Admin', new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      role: String,
      isActive: Boolean
    }, { timestamps: true }));

    // Check if admin exists
    const existing = await AdminModel.findOne();
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin
    const admin = await AdminModel.create({
      email: 'admin@restaurant.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'super-admin',
      isActive: true
    });

    console.log('\n✓ Admin created successfully!');
    console.log('Email: admin@restaurant.com');
    console.log('Password: admin123');
    console.log('\n⚠️ Change password after first login!\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();

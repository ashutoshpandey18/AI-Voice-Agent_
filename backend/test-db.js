require('dotenv').config();
const mongoose = require('mongoose');

async function testLogin() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/voice-agent';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Check Admin collection
    const AdminModel = mongoose.model('Admin', new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      role: String,
      isActive: Boolean
    }, { timestamps: true }));

    const adminCount = await AdminModel.countDocuments();
    console.log(`📊 Total admins in database: ${adminCount}\n`);

    if (adminCount > 0) {
      const admins = await AdminModel.find({}, 'email name role isActive createdAt');
      console.log('👥 Admin accounts:');
      admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.role}) - Active: ${admin.isActive}`);
      });
      console.log('\n✅ Database is ready for login!');
      console.log('\nTest login with:');
      console.log('  Email: admin@restaurant.com');
      console.log('  Password: admin123');
    } else {
      console.log('❌ No admin accounts found!');
      console.log('Run: node seed-simple.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();

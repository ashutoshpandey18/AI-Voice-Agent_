#!/usr/bin/env node
// Simple MongoDB connection test script
// Usage: node scripts/test-mongo-connection.js [MONGO_URI]

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const uri = process.argv[2] || process.env.MONGO_URI;
if (!uri) {
  console.error('ERROR: No MONGO_URI provided. Pass as first arg or set in root .env');
  process.exit(2);
}

console.log('[Test] Using MONGO_URI:', uri.startsWith('mongodb') ? uri.replace(/:(.*)@/, ':****@') : uri);

(async () => {
  try {
    await mongoose.connect(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });
    console.log('[Test] MongoDB connected successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Test] MongoDB connection failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();

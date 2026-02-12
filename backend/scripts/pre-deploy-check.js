#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to catch issues early
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-Deployment Verification\n');

const checks = [];
let passed = 0;
let failed = 0;

// Check 1: .gitignore files exist
console.log('📁 Checking .gitignore files...');
const backendGitignore = fs.existsSync(path.join(__dirname, '.gitignore'));
const frontendGitignore = fs.existsSync(path.join(__dirname, '../frontend/.gitignore'));

if (backendGitignore && frontendGitignore) {
  console.log('  ✅ Both .gitignore files exist');
  passed++;
} else {
  console.log('  ❌ Missing .gitignore files');
  failed++;
}

// Check 2: .env files are NOT in git
console.log('\n🔐 Checking .env files are not tracked...');
const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf-8');
if (gitignoreContent.includes('.env')) {
  console.log('  ✅ .env files are gitignored');
  passed++;
} else {
  console.log('  ❌ .env files not in .gitignore!');
  failed++;
}

// Check 3: package.json has required scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const hasAllScripts = packageJson.scripts.build && packageJson.scripts.start;
if (hasAllScripts) {
  console.log('  ✅ Build and start scripts present');
  passed++;
} else {
  console.log('  ❌ Missing build or start script');
  failed++;
}

// Check 4: TypeScript config exists
console.log('\n⚙️  Checking TypeScript configuration...');
const tsConfigExists = fs.existsSync(path.join(__dirname, 'tsconfig.json'));
if (tsConfigExists) {
  console.log('  ✅ tsconfig.json exists');
  passed++;
} else {
  console.log('  ❌ tsconfig.json missing');
  failed++;
}

// Check 5: Environment variable example exists
console.log('\n🌍 Checking .env.example...');
const envExampleExists = fs.existsSync(path.join(__dirname, '.env.example'));
if (envExampleExists) {
  console.log('  ✅ .env.example exists');
  passed++;
} else {
  console.log('  ⚠️  .env.example missing (optional but recommended)');
}

// Check 6: No hardcoded secrets in server.ts
console.log('\n🔒 Checking for hardcoded secrets...');
const serverContent = fs.readFileSync(path.join(__dirname, 'src/server.ts'), 'utf-8');
const hasHardcodedSecrets =
  serverContent.includes('mongodb://') && !serverContent.includes('process.env.MONGO_URI') ||
  serverContent.includes('Bearer ') && !serverContent.includes('process.env');

if (!hasHardcodedSecrets) {
  console.log('  ✅ No obvious hardcoded secrets found');
  passed++;
} else {
  console.log('  ❌ Possible hardcoded secrets detected!');
  failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! You\'re ready to deploy!');
  console.log('\n📖 Next steps:');
  console.log('  1. Commit and push your changes');
  console.log('  2. Follow DEPLOYMENT_GUIDE.md');
  console.log('  3. Deploy backend to Render');
  console.log('  4. Deploy frontend to Vercel');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please fix them before deploying.');
  console.log('   See DEPLOYMENT_GUIDE.md for details.');
  process.exit(1);
}

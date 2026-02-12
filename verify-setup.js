#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🔍 AI Voice Agent - Setup Verification\n');
console.log('=' .repeat(50));

let allPassed = true;

// Check 1: .env file exists
console.log('\n📄 Checking .env file...');
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');

  const envContent = fs.readFileSync(envPath, 'utf-8');

  // Check required variables
  const required = [
    'MONGO_URI',
    'OPENWEATHER_API_KEY',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV'
  ];

  console.log('\n🔑 Checking environment variables...');
  required.forEach(key => {
    const regex = new RegExp(`^${key}\\s*=\\s*.+$`, 'm');
    if (regex.test(envContent)) {
      const match = envContent.match(regex);
      const value = match[0].split('=')[1].trim();

      // Check if it's a placeholder
      if (value.includes('your_') || value.includes('_here') || value.includes('REPLACE-WITH')) {
        console.log(`⚠️  ${key} looks like a placeholder`);
        allPassed = false;
      } else {
        console.log(`✅ ${key} is set`);
      }
    } else {
      console.log(`❌ ${key} is missing`);
      allPassed = false;
    }
  });

  // Check for exposed secrets (old API keys/passwords that were in Git)
  console.log('\n🔐 Checking for exposed secrets...');
  const exposedSecrets = [
    'ad06f3345ac341f255f9c899667f61e7', // Old OpenWeather API key
    'a8f3e9c2b7d1f4e6a9c3b8d2f7e1a4c9b6d3f8e2a7c1b9d4f6e3a8c2b7d1f5e9' // Old JWT secret
    // Note: Not checking old MongoDB password as it's been changed
  ];

  const hasExposed = exposedSecrets.some(secret => envContent.includes(secret));
  if (hasExposed) {
    console.log('❌ Found exposed secrets! Please update your .env file');
    allPassed = false;
  } else {
    console.log('✅ No exposed secrets found');
  }

} else {
  console.log('❌ .env file not found');
  allPassed = false;
}

// Check 2: .gitignore files
console.log('\n📁 Checking .gitignore files...');
const gitignores = [
  path.join(__dirname, 'backend', '.gitignore'),
  path.join(__dirname, 'frontend', '.gitignore')
];

gitignores.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('.env')) {
      console.log(`✅ ${path.basename(path.dirname(file))}/.gitignore protects .env`);
    } else {
      console.log(`❌ ${path.basename(path.dirname(file))}/.gitignore missing .env`);
      allPassed = false;
    }
  } else {
    console.log(`❌ Missing ${path.basename(path.dirname(file))}/.gitignore`);
    allPassed = false;
  }
});

// Check 3: package.json files
console.log('\n📦 Checking package.json files...');
const packageJsons = [
  { path: path.join(__dirname, 'backend', 'package.json'), name: 'Backend' },
  { path: path.join(__dirname, 'frontend', 'package.json'), name: 'Frontend' }
];

packageJsons.forEach(({ path: pkgPath, name }) => {
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.scripts && pkg.scripts.build && pkg.scripts.start) {
      console.log(`✅ ${name} has build and start scripts`);
    } else {
      console.log(`❌ ${name} missing required scripts`);
      allPassed = false;
    }
  } else {
    console.log(`❌ ${name} package.json not found`);
    allPassed = false;
  }
});

// Check 4: TypeScript configs
console.log('\n⚙️  Checking TypeScript configurations...');
const tsConfigs = [
  path.join(__dirname, 'backend', 'tsconfig.json'),
  path.join(__dirname, 'frontend', 'tsconfig.json')
];

tsConfigs.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${path.basename(path.dirname(file))}/tsconfig.json exists`);
  } else {
    console.log(`❌ Missing ${path.basename(path.dirname(file))}/tsconfig.json`);
    allPassed = false;
  }
});

// Final summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('\n✅ ALL CHECKS PASSED! Your setup is ready for deployment.\n');
  console.log('📋 Next steps:');
  console.log('   1. Test locally: npm run dev (in root directory)');
  console.log('   2. Build: npm run build (in both backend and frontend)');
  console.log('   3. Deploy following READY_TO_DEPLOY.md\n');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME CHECKS FAILED. Please fix the issues above.\n');
  console.log('📖 See SECURITY_ACTIONS_REQUIRED.md for guidance.\n');
  process.exit(1);
}

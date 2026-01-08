const https = require('http');

const testLogin = () => {
  const data = JSON.stringify({
    email: 'admin@restaurant.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/admin/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);

      if (res.statusCode === 200) {
        const result = JSON.parse(body);
        const token = result.data.token;
        console.log('\n✅ Login Success!');
        console.log('Token:', token.substring(0, 50) + '...');

        // Test analytics endpoint
        testAnalytics(token);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Login Error:', error.message);
  });

  req.write(data);
  req.end();
};

const testAnalytics = (token) => {
  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/admin/analytics',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('\n📊 Analytics Endpoint:');
      console.log('Status:', res.statusCode);
      console.log('Response:', body);

      if (res.statusCode === 200) {
        console.log('\n✅ Analytics API Working!');
      } else {
        console.log('\n❌ Analytics API Failed');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Analytics Error:', error.message);
  });

  req.end();
};

console.log('🧪 Testing Admin Login & Analytics...\n');
testLogin();

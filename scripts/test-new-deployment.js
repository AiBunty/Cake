// Simple test for the new Apps Script deployment
const https = require('https');

const baseUrl = 'https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec';
const apiKey = 'your-secret-key-123';

console.log('\n🧪 Testing New Apps Script Deployment\n');
console.log('URL:', baseUrl);
console.log('API Key:', apiKey);
console.log('');

async function testApi(route) {
  return new Promise((resolve) => {
    const url = `${baseUrl}?route=${route}&x-api-key=${apiKey}`;
    
    console.log(`\n📡 Testing: ${route}`);
    console.log(`URL: ${url.substring(0, 100)}...`);
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      console.log(`Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200 && res.headers['content-type']?.includes('application/json')) {
            const json = JSON.parse(data);
            console.log('✅ Response:', JSON.stringify(json, null, 2));
            resolve({ ok: true, status: res.statusCode, data: json });
          } else {
            console.log(`❌ Status ${res.statusCode} - Not JSON`);
            console.log('Response:', data.substring(0, 300));
            resolve({ ok: false, status: res.statusCode });
          }
        } catch (error) {
          console.log('❌ Parse error:', error.message);
          resolve({ ok: false, error: error.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      resolve({ ok: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Request timeout');
      resolve({ ok: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  const toppingsResult = await testApi('toppings');
  const productsResult = await testApi('products');
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  
  if (toppingsResult.ok && toppingsResult.status === 200) {
    console.log('✅ Toppings API: WORKING');
    const toppings = toppingsResult.data.data || [];
    console.log(`   Found ${toppings.length} toppings`);
  } else {
    console.log('❌ Toppings API: FAILED');
    console.log(`   Status: ${toppingsResult.status}`);
  }
  
  if (productsResult.ok && productsResult.status === 200) {
    console.log('✅ Products API: WORKING');
    const products = productsResult.data.data || [];
    console.log(`   Found ${products.length} products`);
    
    const withToppings = products.filter(p => p.allowed_toppings);
    console.log(`   Products with toppings: ${withToppings.length}`);
    
    if (withToppings.length > 0) {
      console.log('\n   Sample products with toppings:');
      withToppings.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name}: "${p.allowed_toppings}"`);
      });
    }
  } else {
    console.log('❌ Products API: FAILED');
    console.log(`   Status: ${productsResult.status}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

runTests().catch(console.error);

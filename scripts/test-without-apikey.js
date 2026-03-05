/**
 * Test Apps Script without API key
 * This tests if the issue is with API key validation or deployment
 */

const https = require('https');

const baseUrl = 'https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec';

console.log('\n='.repeat(60));
console.log('TESTING WITHOUT API KEY');
console.log('='.repeat(60));

function testRoute(route, includeApiKey = false) {
  return new Promise((resolve) => {
    let url = `${baseUrl}?route=${route}`;
    if (includeApiKey) {
      url += '&x-api-key=your-secret-key-123';
    }
    
    console.log(`\n📡 Route: ${route}`);
    console.log(`API Key: ${includeApiKey ? 'YES' : 'NO'}`);
    console.log(`First 80 chars of URL: ${url.substring(0, 80)}...`);
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      console.log(`Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            console.log('✅ SUCCESS - JSON Response');
            console.log('Response:', JSON.stringify(json).substring(0, 150));
            resolve(true);
          } catch (e) {
            console.log('❌ FAILED - Invalid JSON');
            resolve(false);
          }
        });
      } else {
        console.log(`❌ FAILED - Status ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (e) => {
      console.log('❌ FAILED - Network Error:', e.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log('❌ FAILED - Timeout');
      resolve(false);
    });
  });
}

async function run() {
  console.log('\nTest 1: Without API key');
  const test1 = await testRoute('toppings', false);
  
  console.log('\n' + '-'.repeat(60));
  console.log('Test 2: With API key');
  const test2 = await testRoute('toppings', true);
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  if (test1) {
    console.log('✅ Apps Script works WITHOUT API key');
    console.log('   → Issue: API key validation in Code.gs');
    console.log('   → Fix: Update Script Properties with correct API_KEY');
  } else if (test2) {
    console.log('✅ Apps Script works WITH API key');
    console.log('   → Issue: Missing API key in URL/request');
  } else {
    console.log('❌ Apps Script not responding (302 redirects)');
    console.log('   → Issue: Web App deployment is incorrect');
    console.log('   → Fix: Re-deploy with proper settings');
    console.log('');
    console.log('REQUIRED DEPLOYMENT SETTINGS:');
    console.log('  1. Type: Web app');
    console.log('  2. Execute as: Your email');
    console.log('  3. Who has access: Anyone');
    console.log('  4. Click Deploy button');
    console.log('  5. Authori authorize all permissions');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

run().catch(console.error);

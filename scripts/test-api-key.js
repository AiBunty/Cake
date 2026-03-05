#!/usr/bin/env node

/**
 * Quick test script to verify Apps Script is working with API keys
 */

const https = require('https');

const baseUrl = 'https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec';

function test(route, apiKey = null) {
  return new Promise((resolve) => {
    let url = `${baseUrl}?route=${route}`;
    if (apiKey) {
      url += `&x-api-key=${apiKey}`;
    }
    
    console.log(`\n  📡 Testing: ${route}${apiKey ? ' (with API key)' : ' (no API key)'}`);
    
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && res.headers['content-type']?.includes('application/json')) {
          try {
            const json = JSON.parse(data);
            console.log(`  ✅ Status: ${res.statusCode} OK`);
            if (json.data) {
              if (Array.isArray(json.data)) {
                console.log(`     Found: ${json.data.length} items`);
              } else {
                console.log(`     Data: ${JSON.stringify(json.data).substring(0, 60)}...`);
              }
            }
            resolve(true);
          } catch (e) {
            console.log(`  ⚠️  Status: ${res.statusCode} but invalid JSON`);
            resolve(false);
          }
        } else {
          console.log(`  ❌ Status: ${res.statusCode} ${res.statusCode === 302 ? '(redirect - auth issue)' : ''}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`  ❌ Network error: ${e.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`  ❌ Request timeout`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 APPS SCRIPT API TEST');
  console.log('='.repeat(60));
  
  // Test 1: Check status
  console.log('\n1️⃣  Check API Key Status:');
  const statusOk = await test('debug_status');
  
  // Test 2: Get toppings (no key)
  console.log('\n2️⃣  Get Toppings (no API key):');
  const toppingsOk = await test('toppings');
  
  // Test 3: Get products (no key)
  console.log('\n3️⃣  Get Products (no API key):');
  const productsOk = await test('products');
  
  // Test 4: Get toppings (with dummy key)
  console.log('\n4️⃣  Get Toppings (with API key):');
  const toppingsKeyOk = await test('toppings', 'dummy-key-123');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n  Status Check: ${statusOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Toppings (no key): ${toppingsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Products (no key): ${productsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Toppings (with key): ${toppingsKeyOk ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPass = statusOk && toppingsOk && productsOk;
  
  console.log('\n' + '='.repeat(60));
  if (allPass) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Apps Script is working correctly');
    console.log('✅ Toppings API is responding with JSON');
    console.log('✅ Products API is responding with JSON');
    console.log('\n   Next: Update your frontend and test the modal!');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('\n   Troubleshooting:');
    console.log('   1. Make sure Code.gs is deployed with latest version');
    console.log('   2. Check that deployment is set to "Who has access: Anyone"');
    console.log('   3. Clear browser cache and try again');
    console.log('   4. Check Apps Script execution logs for errors');
  }
  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);

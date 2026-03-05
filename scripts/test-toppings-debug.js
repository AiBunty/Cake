/**
 * Debug script to test toppings functionality
 * Tests both the Apps Script endpoint directly and through the Next.js proxy
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.substring(0, eqIndex).trim();
      const value = line.substring(eqIndex + 1).trim();
      envVars[key] = value;
    }
  }
});

const APPS_SCRIPT_BASE_URL = envVars.NEXT_PUBLIC_APPS_SCRIPT_BASE_URL;
const APPS_SCRIPT_API_KEY = envVars.APPS_SCRIPT_API_KEY;

console.log('🔍 TOPPINGS DEBUGGING TEST\n');
console.log('Configuration:');
console.log('- Apps Script URL:', APPS_SCRIPT_BASE_URL);
console.log('- API Key:', APPS_SCRIPT_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('');

async function fetchData(url, description) {
  return new Promise((resolve) => {
    console.log(`\n📡 Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            const json = JSON.parse(data);
            console.log('✅ Response (JSON):', JSON.stringify(json, null, 2));
            resolve({ ok: true, data: json });
          } else {
            console.log('⚠️  Response is not JSON:');
            console.log(data.substring(0, 500));
            resolve({ ok: false, error: 'Not JSON', rawData: data });
          }
        } catch (error) {
          console.log('❌ Error parsing response:', error.message);
          console.log('Raw data:', data.substring(0, 500));
          resolve({ ok: false, error: error.message, rawData: data });
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
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Direct Apps Script - Toppings');
  console.log('='.repeat(60));
  
  const toppingsUrl = `${APPS_SCRIPT_BASE_URL}?route=toppings&x-api-key=${APPS_SCRIPT_API_KEY}`;
  const toppingsResult = await fetchData(toppingsUrl, 'GET Toppings (Direct)');
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Direct Apps Script - Products');
  console.log('='.repeat(60));
  
  const productsUrl = `${APPS_SCRIPT_BASE_URL}?route=products&x-api-key=${APPS_SCRIPT_API_KEY}`;
  const productsResult = await fetchData(productsUrl, 'GET Products (Direct)');
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Next.js Proxy - Toppings');
  console.log('='.repeat(60));
  
  const proxyToppingsUrl = 'http://localhost:3000/api/apps-script?route=toppings';
  const proxyToppingsResult = await fetchData(proxyToppingsUrl, 'GET Toppings (Proxy)');
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Next.js Proxy - Products');
  console.log('='.repeat(60));
  
  const proxyProductsUrl = 'http://localhost:3000/api/apps-script?route=products';
  const proxyProductsResult = await fetchData(proxyProductsUrl, 'GET Products (Proxy)');
  
  console.log('\n\n' + '='.repeat(60));
  console.log('ANALYSIS');
  console.log('='.repeat(60));
  
  // Analyze toppings data
  if (toppingsResult.ok && toppingsResult.data?.ok) {
    const toppings = toppingsResult.data.data || [];
    console.log(`\n✅ Toppings found: ${toppings.length}`);
    if (toppings.length > 0) {
      console.log('Sample topping:', JSON.stringify(toppings[0], null, 2));
    }
  } else {
    console.log('\n❌ Failed to fetch toppings from Apps Script');
  }
  
  // Analyze products data
  if (productsResult.ok && productsResult.data?.ok) {
    const products = productsResult.data.data || [];
    console.log(`\n✅ Products found: ${products.length}`);
    
    const productsWithToppings = products.filter(p => p.allowed_toppings);
    console.log(`Products with allowed_toppings: ${productsWithToppings.length}`);
    
    if (productsWithToppings.length > 0) {
      console.log('\nProducts with toppings:');
      productsWithToppings.forEach(p => {
        console.log(`- ${p.name}: "${p.allowed_toppings}"`);
      });
    }
  } else {
    console.log('\n❌ Failed to fetch products from Apps Script');
  }
  
  // Check proxy functionality
  console.log('\n📊 Proxy Status:');
  console.log(`- Toppings proxy: ${proxyToppingsResult.ok ? '✅' : '❌'}`);
  console.log(`- Products proxy: ${proxyProductsResult.ok ? '✅' : '❌'}`);
  
  // Cross-reference
  if (toppingsResult.ok && productsResult.ok && toppingsResult.data?.ok && productsResult.data?.ok) {
    const toppings = toppingsResult.data.data || [];
    const products = productsResult.data.data || [];
    
    console.log('\n🔗 Checking Product-Topping Linkage:');
    
    products.forEach(product => {
      if (product.allowed_toppings) {
        // Split by various separators
        const allowedIds = product.allowed_toppings
          .split(/[\s,;|]+/)
          .map(id => id.trim().toLowerCase())
          .filter(id => id.length > 0);
        
        const matchingToppings = toppings.filter(t => 
          allowedIds.includes(t.id.toLowerCase())
        );
        
        console.log(`\n  Product: ${product.name}`);
        console.log(`  Allowed IDs: [${allowedIds.join(', ')}]`);
        console.log(`  Matching Toppings: ${matchingToppings.length}`);
        
        if (matchingToppings.length === 0 && allowedIds.length > 0) {
          console.log(`  ⚠️  WARNING: No matching toppings found!`);
          console.log(`  Available topping IDs: [${toppings.map(t => t.id).join(', ')}]`);
        } else if (matchingToppings.length > 0) {
          console.log(`  ✅ Toppings: [${matchingToppings.map(t => t.name).join(', ')}]`);
        }
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(console.error);

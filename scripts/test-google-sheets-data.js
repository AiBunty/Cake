/**
 * Google Sheets Data Test Script
 * Run this with: node scripts/test-google-sheets-data.js
 * 
 * Tests all data fetching from Google Sheets to verify:
 * - API connectivity
 * - Products data structure
 * - Toppings data structure
 * - TimeSlots availability
 * - Settings configuration
 * - Product-Topping linkage
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let APPS_SCRIPT_URL = '';
let API_KEY = '';

try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envLines = envFile.split('\n');
  
  envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_APPS_SCRIPT_BASE_URL=')) {
      APPS_SCRIPT_URL = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    if (line.startsWith('NEXT_PUBLIC_APPS_SCRIPT_URL=')) {
      APPS_SCRIPT_URL = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    if (line.startsWith('APPS_SCRIPT_API_KEY=')) {
      API_KEY = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  });
} catch (error) {
  console.error('❌ Error reading .env.local file:', error.message);
  process.exit(1);
}

if (!APPS_SCRIPT_URL) {
  console.error('❌ NEXT_PUBLIC_APPS_SCRIPT_BASE_URL not found in .env.local');
  process.exit(1);
}

console.log('🔍 Google Sheets Data Test\n');
console.log('📡 Apps Script URL:', APPS_SCRIPT_URL);
console.log('🔑 API Key:', API_KEY ? '✓ Configured' : '⚠️  Not configured');
console.log('━'.repeat(60));

// Helper function to make API requests
function fetchData(route) {
  return new Promise((resolve, reject) => {
    const url = new URL(APPS_SCRIPT_URL);
    url.searchParams.append('route', route);
    if (API_KEY) url.searchParams.append('x-api-key', API_KEY);

    https.get(url.toString(), (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse JSON: ' + error.message));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Test functions
async function testProducts() {
  console.log('\n📦 Testing PRODUCTS...');
  try {
    const response = await fetchData('products');
    
    if (!response.ok) {
      console.error('❌ Products fetch failed:', response.error);
      return { success: false, data: null };
    }

    const products = response.data;
    console.log(`✅ Fetched ${products.length} products`);

    // Check structure
    const requiredFields = ['id', 'name', 'description', 'price_inr', 'image_url', 'category', 'is_available', 'sort_order'];
    const optionalFields = ['allowed_toppings'];
    
    let structureValid = true;
    let productsWithToppings = 0;

    products.forEach((product, index) => {
      const missing = requiredFields.filter(field => !(field in product));
      if (missing.length > 0) {
        console.warn(`⚠️  Product ${index + 1} (${product.id || 'unknown'}) missing fields: ${missing.join(', ')}`);
        structureValid = false;
      }

      if (product.allowed_toppings && product.allowed_toppings.trim().length > 0) {
        productsWithToppings++;
        console.log(`   └─ ${product.name} → Toppings: "${product.allowed_toppings}"`);
      }
    });

    if (structureValid) {
      console.log('✅ All products have required fields');
    }

    console.log(`📊 Products with toppings configured: ${productsWithToppings}/${products.length}`);
    
    if (productsWithToppings === 0) {
      console.warn('⚠️  WARNING: No products have allowed_toppings configured!');
      console.warn('   Add values like "top001 top005" to Column I in Products tab');
    }

    return { success: true, data: products };
  } catch (error) {
    console.error('❌ Products test failed:', error.message);
    return { success: false, data: null };
  }
}

async function testToppings() {
  console.log('\n🍓 Testing TOPPINGS...');
  try {
    const response = await fetchData('toppings');
    
    if (!response.ok) {
      console.error('❌ Toppings fetch failed:', response.error);
      if (response.error.includes('not found')) {
        console.warn('⚠️  CRITICAL: Toppings tab does not exist in Google Sheet!');
        console.warn('   Create a "Toppings" tab with columns: id, name, description, price_inr, icon_emoji, is_available, sort_order');
      }
      return { success: false, data: null };
    }

    const toppings = response.data;
    console.log(`✅ Fetched ${toppings.length} toppings`);

    if (toppings.length === 0) {
      console.warn('⚠️  WARNING: Toppings tab exists but has no data!');
      console.warn('   Add sample toppings like top001, top002, etc.');
      return { success: false, data: [] };
    }

    // Check structure
    const requiredFields = ['id', 'name', 'description', 'price_inr', 'icon_emoji', 'is_available', 'sort_order'];
    
    let structureValid = true;
    let availableCount = 0;

    toppings.forEach((topping, index) => {
      const missing = requiredFields.filter(field => !(field in topping));
      if (missing.length > 0) {
        console.warn(`⚠️  Topping ${index + 1} (${topping.id || 'unknown'}) missing fields: ${missing.join(', ')}`);
        structureValid = false;
      }

      if (topping.is_available) {
        availableCount++;
        console.log(`   └─ ${topping.icon_emoji} ${topping.id}: ${topping.name} (₹${topping.price_inr})`);
      } else {
        console.log(`   └─ ${topping.icon_emoji} ${topping.id}: ${topping.name} (UNAVAILABLE)`);
      }
    });

    if (structureValid) {
      console.log('✅ All toppings have required fields');
    }

    console.log(`📊 Available toppings: ${availableCount}/${toppings.length}`);

    return { success: true, data: toppings };
  } catch (error) {
    console.error('❌ Toppings test failed:', error.message);
    return { success: false, data: null };
  }
}

async function testTimeSlots() {
  console.log('\n📅 Testing TIME SLOTS...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetchData(`timeslots&date=${today}`);
    
    if (!response.ok) {
      console.error('❌ TimeSlots fetch failed:', response.error);
      return { success: false, data: null };
    }

    const slots = response.data;
    console.log(`✅ Fetched ${slots.length} time slots for ${today}`);

    if (slots.length === 0) {
      console.warn(`⚠️  No time slots available for today (${today})`);
      console.warn('   Add dates to TimeSlots tab or test with a future date');
    } else {
      slots.forEach(slot => {
        console.log(`   └─ ${slot.slot_label} (${slot.start_time}-${slot.end_time}): ${slot.available_slots}/${slot.max_orders} available`);
      });
    }

    return { success: true, data: slots };
  } catch (error) {
    console.error('❌ TimeSlots test failed:', error.message);
    return { success: false, data: null };
  }
}

async function testSettings() {
  console.log('\n⚙️  Testing SETTINGS...');
  try {
    const response = await fetchData('settings');
    
    if (!response.ok) {
      console.error('❌ Settings fetch failed:', response.error);
      return { success: false, data: null };
    }

    const settings = response.data;
    const keys = Object.keys(settings);
    console.log(`✅ Fetched ${keys.length} settings`);

    if (keys.length === 0) {
      console.warn('⚠️  Settings tab exists but has no data!');
    } else {
      keys.forEach(key => {
        console.log(`   └─ ${key}: ${settings[key]}`);
      });
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error('❌ Settings test failed:', error.message);
    return { success: false, data: null };
  }
}

function testProductToppingLinkage(products, toppings) {
  console.log('\n🔗 Testing PRODUCT-TOPPING LINKAGE...');
  
  if (!products || !toppings) {
    console.error('❌ Cannot test linkage - missing products or toppings data');
    return;
  }

  const toppingIds = new Set(toppings.map(t => t.id.toLowerCase()));
  let validLinks = 0;
  let invalidLinks = 0;
  let productsChecked = 0;

  products.forEach(product => {
    if (product.allowed_toppings && product.allowed_toppings.trim().length > 0) {
      productsChecked++;
      const allowedIds = product.allowed_toppings
        .split(/[\s,]+/)
        .map(id => id.trim().toLowerCase())
        .filter(id => id.length > 0);

      console.log(`\n   📦 ${product.name}:`);
      console.log(`      Configured: "${product.allowed_toppings}"`);
      
      let productValid = true;
      allowedIds.forEach(id => {
        if (toppingIds.has(id)) {
          const topping = toppings.find(t => t.id.toLowerCase() === id);
          console.log(`      ✅ ${id} → ${topping.icon_emoji} ${topping.name}`);
          validLinks++;
        } else {
          console.log(`      ❌ ${id} → NOT FOUND IN TOPPINGS TAB!`);
          invalidLinks++;
          productValid = false;
        }
      });

      if (!productValid) {
        console.warn(`      ⚠️  This product has invalid topping IDs!`);
      }
    }
  });

  console.log(`\n📊 Linkage Summary:`);
  console.log(`   Products with toppings: ${productsChecked}`);
  console.log(`   Valid topping links: ${validLinks}`);
  console.log(`   Invalid topping links: ${invalidLinks}`);

  if (invalidLinks > 0) {
    console.warn('\n⚠️  FIX REQUIRED: Some products reference non-existent toppings!');
    console.warn('   Update allowed_toppings column to use valid topping IDs from Toppings tab');
  } else if (productsChecked > 0) {
    console.log('\n✅ All product-topping linkages are valid!');
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 Starting comprehensive data tests...\n');
  
  const results = {
    products: await testProducts(),
    toppings: await testToppings(),
    timeSlots: await testTimeSlots(),
    settings: await testSettings(),
  };

  // Test linkage if both products and toppings succeeded
  if (results.products.success && results.toppings.success) {
    testProductToppingLinkage(results.products.data, results.toppings.data);
  }

  // Final summary
  console.log('\n' + '━'.repeat(60));
  console.log('📋 FINAL SUMMARY\n');

  const allSuccess = Object.values(results).every(r => r.success);
  
  if (allSuccess) {
    console.log('✅ All tests passed! Google Sheets data is properly configured.');
  } else {
    console.log('⚠️  Some tests failed. Review the output above for details.\n');
    
    console.log('🔧 TROUBLESHOOTING CHECKLIST:');
    
    if (!results.products.success) {
      console.log('   ❌ Products: Check Products tab exists with correct column headers');
    }
    
    if (!results.toppings.success) {
      console.log('   ❌ Toppings: Create Toppings tab with sample data');
      console.log('      → See: GEMINI_PROMPT_TOPPINGS_SETUP.md for instructions');
    }
    
    if (results.products.data && results.products.data.length > 0) {
      const withToppings = results.products.data.filter(p => 
        p.allowed_toppings && p.allowed_toppings.trim().length > 0
      ).length;
      
      if (withToppings === 0) {
        console.log('   ⚠️  Products: Add allowed_toppings values to Column I');
        console.log('      → Example: "top001 top005 top008"');
      }
    }
    
    if (results.toppings.data && results.toppings.data.length === 0) {
      console.log('   ⚠️  Toppings: Add topping data to Toppings tab');
      console.log('      → See: google-sheets-setup/SHEETS_SETUP_GUIDE.md');
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('📝 Next Steps:');
  console.log('   1. Fix any issues reported above');
  console.log('   2. Redeploy Google Apps Script if you made changes');
  console.log('   3. Clear browser cache: localStorage.clear()');
  console.log('   4. Test website at http://localhost:3001');
  console.log('   5. Check browser console for errors\n');

  process.exit(allSuccess ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});

/**
 * HELPER SCRIPT: Add Allowed Toppings to Products
 * 
 * This script adds the "Allowed Toppings" column to your Products sheet
 * and sets default topping IDs for each product.
 * 
 * Run this AFTER running setupToppingsTab()
 * 
 * How to use:
 * 1. Run setupToppingsTab() first (to create toppings)
 * 2. Run addAllowedToppingsColumn() to add column to Products
 * 3. Verify in Products sheet - column I should have topping IDs
 */

function addAllowedToppingsColumn() {
  const ss = SpreadsheetApp.openById('1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  const sheet = ss.getSheetByName('Products');
  
  if (!sheet) {
    Logger.log('❌ Products sheet not found');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  // Check if column I (index 9) exists
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  Logger.log('📊 Current columns: ' + headerRow.length);
  Logger.log('📋 Headers: ' + JSON.stringify(headerRow));
  
  // Add header if column I doesn't exist or is empty
  if (lastCol < 9 || !headerRow[8]) {
    sheet.getRange(1, 9).setValue('Allowed Toppings');
    sheet.getRange(1, 9).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
    Logger.log('✅ Added "Allowed Toppings" header to column I');
  } else {
    Logger.log('ℹ️  Column I already exists: ' + headerRow[8]);
  }
  
  // Default: Allow all toppings for all products
  const allToppings = 'T001,T002,T003,T004,T005,T006,T007,T008,T009,T010';
  
  // Update each product row (starting from row 2)
  for (let i = 2; i <= lastRow; i++) {
    const currentValue = sheet.getRange(i, 9).getValue();
    
    // Only update if empty
    if (!currentValue || currentValue.toString().trim() === '') {
      sheet.getRange(i, 9).setValue(allToppings);
      Logger.log('✅ Updated row ' + i + ' with default toppings');
    } else {
      Logger.log('ℹ️  Row ' + i + ' already has toppings: ' + currentValue);
    }
  }
  
  Logger.log('✅ Products sheet updated with allowed toppings!');
  Logger.log('📊 Updated ' + (lastRow - 1) + ' products');
}

/**
 * Set specific toppings for specific products
 * Customize this based on your needs
 */
function setCustomToppingsPerProduct() {
  const ss = SpreadsheetApp.openById('1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  const sheet = ss.getSheetByName('Products');
  
  if (!sheet) {
    Logger.log('❌ Products sheet not found');
    return;
  }
  
  // Example: Set different toppings for different products
  // Format: Row number → Topping IDs
  const customToppings = {
    2: 'T001,T002,T005,T008',  // Row 2 product: Chocolate, Sprinkles, Caramel, Cookies
    3: 'T003,T006,T007,T010',  // Row 3 product: Cream, Berries, Coconut, Pistachio
    4: 'T001,T002,T003,T004,T005,T006,T007,T008,T010', // Row 4: All except T009
    // Add more rows as needed
  };
  
  Object.entries(customToppings).forEach(([row, toppings]) => {
    sheet.getRange(parseInt(row), 9).setValue(toppings);
    Logger.log('✅ Set custom toppings for row ' + row);
  });
  
  Logger.log('✅ Custom toppings configuration complete!');
}

/**
 * View current Products data with toppings
 */
function viewProductsWithToppings() {
  const ss = SpreadsheetApp.openById('1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  const sheet = ss.getSheetByName('Products');
  
  if (!sheet) {
    Logger.log('❌ Products sheet not found');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  Logger.log('📊 Products with Toppings:');
  Logger.log('Total rows: ' + data.length);
  
  for (let i = 0; i < Math.min(5, data.length); i++) {
    Logger.log('Row ' + (i + 1) + ':');
    Logger.log('  ID: ' + data[i][0]);
    Logger.log('  Name: ' + data[i][1]);
    Logger.log('  Allowed Toppings (col I): ' + data[i][8]);
  }
}

/**
 * Quick fix: Add column and set all products to allow all toppings
 * Run this if you just want everything to work quickly
 */
function quickFixProductsToppings() {
  Logger.log('🚀 Quick Fix: Adding toppings to all products...');
  
  // Add column
  addAllowedToppingsColumn();
  
  // View result
  viewProductsWithToppings();
  
  Logger.log('✅ Quick fix complete!');
  Logger.log('📝 Next: Redeploy Code.gs and test in your app');
}

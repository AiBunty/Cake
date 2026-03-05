/**
 * HELPER SCRIPT: Setup Toppings Tab
 * 
 * This script sets up the Toppings sheet with the correct columns and sample data.
 * Run this function from Apps Script Editor:
 * 1. Open your Apps Script project
 * 2. Create a new file (+ icon) and name it "SetupToppingsTab"
 * 3. Paste this code
 * 4. Run the setupToppingsTab() function
 * 5. Check the Toppings sheet in your Google Sheet
 */

function setupToppingsTab() {
  const ss = SpreadsheetApp.openById('1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  let sheet = ss.getSheetByName('Toppings');
  
  // Delete existing Toppings sheet if it exists
  if (sheet) {
    ss.deleteSheet(sheet);
    Logger.log('✅ Deleted old Toppings sheet');
  }
  
  // Create new Toppings sheet
  sheet = ss.insertSheet('Toppings', ss.getSheets().length);
  Logger.log('✅ Created new Toppings sheet');
  
  // Set up headers (Row 1)
  const headers = ['ID', 'Name', 'Description', 'Price (INR)', 'Icon/Emoji', 'Is Available', 'Sort Order'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#ffffff');
  
  Logger.log('✅ Created headers');
  
  // Sample topping data
  const toppings = [
    ['T001', 'Chocolate Chips', 'Extra dark chocolate chips', 50, '🍫', 'TRUE', 1],
    ['T002', 'Rainbow Sprinkles', 'Colorful sprinkles', 40, '🌈', 'TRUE', 2],
    ['T003', 'Whipped Cream', 'Fresh whipped cream topping', 60, '🧁', 'TRUE', 3],
    ['T004', 'Nuts (Almonds)', 'Roasted almonds', 80, '🥜', 'TRUE', 4],
    ['T005', 'Caramel Drizzle', 'Smooth caramel sauce', 70, '🍯', 'TRUE', 5],
    ['T006', 'Berries Mix', 'Strawberries & blueberries', 100, '🫐', 'TRUE', 6],
    ['T007', 'Coconut Flakes', 'Toasted coconut flakes', 55, '🥥', 'TRUE', 7],
    ['T008', 'Cookie Crumbles', 'Crushed Oreo cookies', 75, '🍪', 'TRUE', 8],
    ['T009', 'Edible Pearls', 'Silver edible pearls', 90, '⭐', 'FALSE', 9],
    ['T010', 'Pistachio Dust', 'Fine pistachio powder', 85, '💚', 'TRUE', 10],
  ];
  
  // Write data starting from row 2
  if (toppings.length > 0) {
    sheet.getRange(2, 1, toppings.length, toppings[0].length).setValues(toppings);
    Logger.log('✅ Added ' + toppings.length + ' sample toppings');
  }
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  // Format Data rows
  sheet.getRange(2, 1, toppings.length, headers.length)
    .setBackground('#0f172a')
    .setFontColor('#e2e8f0');
  
  Logger.log('✅ Toppings tab setup complete!');
  Logger.log('📊 Sheet ID: 1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  Logger.log('📝 Next: Deploy the new Code.gs version to Apps Script');
}

/**
 * ALTERNATIVE: If you want to add toppings to the existing Toppings sheet instead
 * Run this function to add more toppings to the existing data
 */
function addMoreToppings() {
  const ss = SpreadsheetApp.openById('1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  const sheet = ss.getSheetByName('Toppings');
  
  if (!sheet) {
    Logger.log('❌ Toppings sheet not found. Run setupToppingsTab() first.');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  
  const newToppings = [
    ['T011', 'Gold Dust', 'Edible gold powder', 150, '✨', 'TRUE', 11],
    ['T012', 'Fresh Mint', 'Mint leaves for decoration', 45, '🌿', 'TRUE', 12],
    ['T013', 'Chocolate Sauce', 'Hot chocolate sauce', 65, '🍫', 'TRUE', 13],
  ];
  
  sheet.getRange(lastRow + 1, 1, newToppings.length, newToppings[0].length).setValues(newToppings);
  Logger.log('✅ Added ' + newToppings.length + ' more toppings');
}

/**
 * View current toppings in the logger
 */
function viewCurrentToppings() {
  const ss = SpreadsheetApp.openById('1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg');
  const sheet = ss.getSheetByName('Toppings');
  
  if (!sheet) {
    Logger.log('❌ Toppings sheet not found');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  Logger.log('📊 Current Toppings Data:');
  Logger.log('Rows: ' + data.length);
  
  for (let i = 0; i < Math.min(5, data.length); i++) {
    Logger.log('Row ' + (i + 1) + ': ' + JSON.stringify(data[i]));
  }
}

/**
 * INITIALIZATION HELPER SCRIPT
 * Run this once after deploying Code.gs to populate your Google Sheet with sample data
 */

/**
 * Menu item to run initialization
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎂 Cake System')
    .addItem('📦 Initialize Sample Data', 'initializeSampleData')
    .addItem('🔄 Clear All Data', 'clearAllData')
    .addItem('✅ Verify Setup', 'verifySetup')
    .addItem('⚙️ Install Triggers', 'installTriggers')
    .addToUi();
}

/**
 * Initialize Google Sheet with sample data
 */
function initializeSampleData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Initialize Sample Data',
    'This will add 20 sample cake products and time slots to your sheets. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    createSampleProducts();
    createSampleTimeSlots();
    createSampleSettings();
    
    ui.alert(
      '✅ Success!',
      'Sample data has been added to your sheets.\n\n' +
      '• 20 Products added\n' +
      '• 24 Time slots added (next 8 days)\n' +
      '• Settings configured\n\n' +
      'You can now deploy your Apps Script and test the website!',
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert('❌ Error', 'Failed to initialize data: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Add sample products to Products sheet
 */
function createSampleProducts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Products');
  
  // Check if already has data
  if (sheet.getLastRow() > 1) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Products Already Exist',
      'The Products sheet already has data. Do you want to clear it and add sample data?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      // Clear existing data (keep header)
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    } else {
      return;
    }
  }
  
  const products = [
    ['CAKE001', 'Chocolate Fudge Delight', 'Rich dark chocolate cake with smooth fudge frosting and chocolate shavings', 1200, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', 'Birthday', true, 1],
    ['CAKE002', 'Red Velvet Classic', 'Smooth red velvet cake with cream cheese frosting and elegant finish', 1400, 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800', 'Birthday', true, 2],
    ['CAKE003', 'Strawberry Dream', 'Fresh strawberry cake with whipped cream and seasonal berries', 1600, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800', 'Birthday', true, 3],
    ['CAKE004', 'Black Forest Heaven', 'Classic black forest with cherries and dark chocolate layers', 1500, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800', 'Birthday', true, 4],
    ['CAKE005', 'Vanilla Bean Elegance', 'Premium vanilla bean cake with Swiss meringue buttercream', 1300, 'https://images.unsplash.com/photo-1588195538326-c5b1e5b80634?w=800', 'Birthday', true, 5],
    ['CAKE006', 'Triple Tier Wedding Bliss', 'Elegant three-tier wedding cake with royal icing and floral decor', 12000, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', 'Wedding', true, 6],
    ['CAKE007', 'Rose Garden Wedding', 'Romantic rose-themed wedding cake with buttercream flowers', 15000, 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800', 'Wedding', true, 7],
    ['CAKE008', 'Naked Cake Rustic Charm', 'Minimalist naked cake with fresh flowers and berries', 8000, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800', 'Wedding', true, 8],
    ['CAKE009', 'Golden Anniversary Special', 'Luxurious gold-themed cake perfect for milestone celebrations', 2500, 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800', 'Anniversary', true, 9],
    ['CAKE010', 'Heart Shape Romance', 'Beautiful heart-shaped cake with red roses and romantic design', 1800, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800', 'Anniversary', true, 10],
    ['CAKE011', 'Tiramisu Temptation', 'Italian classic with espresso-soaked layers and mascarpone cream', 1700, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800', 'Custom', true, 11],
    ['CAKE012', 'Mango Madness', 'Tropical mango mousse cake with fresh mango pieces', 1600, 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800', 'Custom', true, 12],
    ['CAKE013', 'Matcha Green Tea', 'Premium matcha green tea cake with white chocolate ganache', 1900, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', 'Custom', true, 13],
    ['CAKE014', 'Unicorn Rainbow Delight', 'Colorful rainbow layers with unicorn-themed decoration', 2200, 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800', 'Birthday', true, 14],
    ['CAKE015', 'Chocolate Cupcake Box', 'Set of 12 gourmet chocolate cupcakes with assorted toppings', 800, 'https://images.unsplash.com/photo-1587241321921-91a834d82f76?w=800', 'Cupcakes', true, 15],
    ['CAKE016', 'Vanilla Cupcake Assortment', 'Set of 12 vanilla cupcakes with buttercream frosting', 750, 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800', 'Cupcakes', true, 16],
    ['CAKE017', 'Red Velvet Cupcakes', 'Set of 6 red velvet cupcakes with cream cheese frosting', 450, 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800', 'Cupcakes', true, 17],
    ['CAKE018', 'Blueberry Cheesecake Pastry', 'Individual blueberry cheesecake with graham cracker crust', 300, 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800', 'Pastries', true, 18],
    ['CAKE019', 'Chocolate Eclairs', 'Classic French eclairs with rich chocolate ganache', 250, 'https://images.unsplash.com/photo-1612786410972-cc346289c2eb?w=800', 'Pastries', true, 19],
    ['CAKE020', 'Fruit Tart Collection', 'Assorted mini fruit tarts with custard and fresh seasonal fruits', 600, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800', 'Pastries', true, 20],
  ];
  
  // Add data starting from row 2
  sheet.getRange(2, 1, products.length, products[0].length).setValues(products);
  
  Logger.log('Added ' + products.length + ' sample products');
}

/**
 * Add sample time slots for next 8 days
 */
function createSampleTimeSlots() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TimeSlots');
  
  // Check if already has data
  if (sheet.getLastRow() > 1) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Time Slots Already Exist',
      'The TimeSlots sheet already has data. Do you want to clear it and add sample data?',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      // Clear existing data (keep header)
      if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    } else {
      return;
    }
  }
  
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add slots for next 8 days
  for (let i = 0; i < 8; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Morning slot
    slots.push([dateStr, 'Morning Slot', '10:00', '12:00', 5, true]);
    
    // Afternoon slot
    slots.push([dateStr, 'Afternoon Slot', '14:00', '16:00', 5, true]);
    
    // Evening slot
    slots.push([dateStr, 'Evening Slot', '18:00', '20:00', 5, true]);
  }
  
  // Add data starting from row 2
  sheet.getRange(2, 1, slots.length, slots[0].length).setValues(slots);
  
  Logger.log('Added ' + slots.length + ' sample time slots');
}

/**
 * Add sample settings
 */
function createSampleSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  
  // Check if already has data
  if (sheet.getLastRow() > 1) {
    // Clear existing data (keep header)
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  
  const settings = [
    ['contact_type', 'Customer'],
    ['assigned_to_staff', 'Owner'],
    ['business_name', 'Luxury Cakes'],
    ['business_phone', '+91-9876543210'],
    ['business_email', 'info@luxurycakes.com'],
  ];
  
  // Add data starting from row 2
  sheet.getRange(2, 1, settings.length, 2).setValues(settings);
  
  Logger.log('Added sample settings');
}

/**
 * Clear all data from all sheets
 */
function clearAllData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ Clear All Data',
    'This will remove ALL data from Products, TimeSlots, Orders, CalendarBookings, and Settings.\n\n' +
    'Headers will be preserved. This action cannot be undone!\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Products', 'TimeSlots', 'Orders', 'CalendarBookings', 'Settings'];
  
  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
      Logger.log('Cleared ' + sheetName);
    }
  });
  
  ui.alert('✅ Done', 'All data has been cleared.', ui.ButtonSet.OK);
}

/**
 * Verify that setup is correct
 */
function verifySetup() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const issues = [];
  const success = [];
  
  // Check sheets exist
  const requiredSheets = ['Products', 'TimeSlots', 'Orders', 'CalendarBookings', 'Settings'];
  requiredSheets.forEach(name => {
    if (ss.getSheetByName(name)) {
      success.push('✅ Sheet "' + name + '" exists');
    } else {
      issues.push('❌ Missing sheet: ' + name);
    }
  });
  
  // Check Products has data
  const productsSheet = ss.getSheetByName('Products');
  if (productsSheet && productsSheet.getLastRow() > 1) {
    success.push('✅ Products sheet has ' + (productsSheet.getLastRow() - 1) + ' items');
  } else {
    issues.push('⚠️ Products sheet is empty');
  }
  
  // Check TimeSlots has data
  const timeSlotsSheet = ss.getSheetByName('TimeSlots');
  if (timeSlotsSheet && timeSlotsSheet.getLastRow() > 1) {
    success.push('✅ TimeSlots sheet has ' + (timeSlotsSheet.getLastRow() - 1) + ' slots');
  } else {
    issues.push('⚠️ TimeSlots sheet is empty');
  }
  
  // Check Script Properties
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('APPS_SCRIPT_API_KEY');
  const sheetId = props.getProperty('SHEET_ID');
  
  if (apiKey) {
    success.push('✅ API Key is configured');
  } else {
    issues.push('⚠️ APPS_SCRIPT_API_KEY not set in Script Properties');
  }
  
  if (sheetId) {
    success.push('✅ Sheet ID is configured');
  } else {
    issues.push('⚠️ SHEET_ID not set in Script Properties');
  }
  
  // Display results
  let message = '';
  
  if (success.length > 0) {
    message += '✅ SUCCESS:\n' + success.join('\n') + '\n\n';
  }
  
  if (issues.length > 0) {
    message += '⚠️ ISSUES:\n' + issues.join('\n') + '\n\n';
  }
  
  if (issues.length === 0) {
    message += '\n🎉 Your setup looks good! You can deploy as Web App now.';
  } else {
    message += '\n📝 Please fix the issues above before deploying.';
  }
  
  ui.alert('Setup Verification', message, ui.ButtonSet.OK);
}

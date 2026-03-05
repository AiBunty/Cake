/**
 * UPI PAYMENT SETUP SCRIPT
 * Adds required Orders columns, UPIPayments tab, and Settings keys
 */

function setupUpiPaymentSupport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orders = ss.getSheetByName('Orders');
  const settings = ss.getSheetByName('Settings');

  if (!orders) {
    Logger.log('❌ Orders sheet not found');
    return;
  }

  if (!settings) {
    Logger.log('❌ Settings sheet not found');
    return;
  }

  ensureOrdersUpiColumns(orders);
  ensureUpiPaymentsSheet(ss);
  ensureUpiSettings(settings);

  Logger.log('✅ UPI payment support setup completed');
}

function ensureOrdersUpiColumns(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss ? ss.getSheetByName('Orders') : null;
  }

  if (!sheet) {
    Logger.log('❌ Orders sheet not found');
    return;
  }

  const requiredColumns = [
    'payment_method',
    'upi_utr',
    'upi_status',
    'upi_screenshot_url',
    'upi_submitted_at',
  ];

  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const header = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map((v) => (v || '').toString().trim());
  const existingSet = {};

  for (let i = 0; i < header.length; i++) {
    existingSet[header[i]] = true;
  }

  const missing = requiredColumns.filter((name) => !existingSet[name]);

  if (missing.length === 0) {
    Logger.log('✅ Orders sheet already has all UPI columns');
    return;
  }

  const insertAt = sheet.getLastColumn() + 1;
  sheet.insertColumnsAfter(sheet.getLastColumn(), missing.length);
  sheet.getRange(1, insertAt, 1, missing.length).setValues([missing]);

  Logger.log('✅ Added Orders columns: ' + missing.join(', '));
}

function ensureUpiPaymentsSheet(ss) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  if (!ss) {
    Logger.log('❌ Active spreadsheet not found');
    return;
  }

  let sheet = ss.getSheetByName('UPIPayments');

  if (!sheet) {
    sheet = ss.insertSheet('UPIPayments', ss.getSheets().length);
    Logger.log('✅ Created UPIPayments sheet');
  }

  const headers = ['order_id', 'created_at', 'amount', 'upi_utr', 'screenshot_url', 'status'];
  const currentHeader = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeader = currentHeader[0] === 'order_id';

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function ensureUpiSettings(sheet) {
  if (!sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    sheet = ss ? ss.getSheetByName('Settings') : null;
  }

  if (!sheet) {
    Logger.log('❌ Settings sheet not found');
    return;
  }

  const requiredSettings = {
    upi_vpa: 'your-upi-id@bank',
    upi_payee_name: 'Cake Studio',
    upi_screenshot_folder_id: '',
    admin_panel_key: '',
  };

  const data = sheet.getDataRange().getValues();
  const existingKeys = {};

  for (let i = 1; i < data.length; i++) {
    const key = data[i][0] ? data[i][0].toString().trim() : '';
    if (key) {
      existingKeys[key] = true;
    }
  }

  const rowsToAdd = [];
  Object.keys(requiredSettings).forEach((key) => {
    if (!existingKeys[key]) {
      rowsToAdd.push([key, requiredSettings[key]]);
    }
  });

  if (rowsToAdd.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rowsToAdd.length, 2).setValues(rowsToAdd);
    Logger.log('✅ Added Settings keys: ' + rowsToAdd.map((r) => r[0]).join(', '));
  } else {
    Logger.log('✅ Settings already has required UPI keys');
  }
}

function quickFixUpiPaymentSupport() {
  try {
    setupUpiPaymentSupport();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const orders = ss.getSheetByName('Orders');
    const upiPayments = ss.getSheetByName('UPIPayments');

    Logger.log('--- Verification ---');
    Logger.log('Orders columns: ' + orders.getLastColumn());
    Logger.log('UPIPayments rows: ' + upiPayments.getLastRow());
    Logger.log('✅ Quick fix complete');
  } catch (error) {
    Logger.log('❌ Quick fix failed: ' + error.toString());
  }
}

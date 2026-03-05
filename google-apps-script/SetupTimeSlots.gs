/**
 * SETUP HELPER SCRIPT FOR TIME SLOTS
 * Run setupTimeSlots() to create/populate TimeSlots tab with correct data
 */

function setupTimeSlots() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('TimeSlots');
  
  if (!sheet) {
    Logger.log('❌ TimeSlots sheet not found!');
    return;
  }
  
  // Check if sheet has header
  const firstRow = sheet.getRange(1, 1, 1, 6).getValues()[0];
  const hasHeader = firstRow[0] === 'date' || firstRow[0] === 'Date';
  
  if (!hasHeader) {
    Logger.log('⚠️ Adding header row to TimeSlots sheet');
    sheet.insertRows(1, 1);
    sheet.getRange(1, 1, 1, 6).setValues([['date', 'slot_label', 'start_time', 'end_time', 'max_orders', 'is_open']]);
  }
  
  // Clear existing data (keep header)
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }
  
  // Create time slots for next 30 days
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Morning slot: 10:00 - 12:00
    slots.push([dateStr, 'Morning Slot', '10:00', '12:00', 5, true]);
    
    // Afternoon slot: 14:00 - 16:00
    slots.push([dateStr, 'Afternoon Slot', '14:00', '16:00', 5, true]);
    
    // Evening slot: 18:00 - 20:00
    slots.push([dateStr, 'Evening Slot', '18:00', '20:00', 5, true]);
  }
  
  // Add all slots starting from row 2
  if (slots.length > 0) {
    sheet.getRange(2, 1, slots.length, 6).setValues(slots);
    Logger.log('✅ Added ' + slots.length + ' time slots for next 30 days');
    
    // Log sample dates
    const sampleDates = [slots[0][0], slots[3][0], slots[6][0]];
    Logger.log('📅 Sample dates: ' + sampleDates.join(', '));
  }
}

function viewTimeSlots() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('TimeSlots');
  
  if (!sheet) {
    Logger.log('❌ TimeSlots sheet not found');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  Logger.log('📊 TimeSlots Sheet Content:');
  Logger.log('Total rows: ' + data.length);
  
  if (data.length > 1) {
    // Show first 5 rows
    for (let i = 0; i < Math.min(6, data.length); i++) {
      const row = data[i];
      Logger.log(`Row ${i + 1}: ${row[0]} | ${row[1]} | ${row[2]}-${row[3]} | Max: ${row[4]} | Open: ${row[5]}`);
    }
    
    // Log unique dates
    const dates = new Set();
    for (let i = 1; i < data.length; i++) {
      dates.add(data[i][0]);
    }
    Logger.log('📅 Unique dates in TimeSlots: ' + Array.from(dates).slice(0, 5).join(', ') + ' ...');
  } else {
    Logger.log('⚠️ TimeSlots sheet is empty (no data rows)');
  }
}

function addMoreTimeSlots(additionalDays = 15) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('TimeSlots');
  
  if (!sheet) {
    Logger.log('❌ TimeSlots sheet not found');
    return;
  }
  
  // Find last date in sheet
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log('❌ TimeSlots sheet is empty');
    return;
  }
  
  // Get the last date from the data
  const lastDateStr = data[data.length - 1][0];
  const lastDate = new Date(lastDateStr);
  
  const slots = [];
  
  for (let i = 1; i <= additionalDays; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    slots.push([dateStr, 'Morning Slot', '10:00', '12:00', 5, true]);
    slots.push([dateStr, 'Afternoon Slot', '14:00', '16:00', 5, true]);
    slots.push([dateStr, 'Evening Slot', '18:00', '20:00', 5, true]);
  }
  
  if (slots.length > 0) {
    const startRow = data.length + 1;
    sheet.getRange(startRow, 1, slots.length, 6).setValues(slots);
    Logger.log('✅ Added ' + slots.length + ' more time slots');
  }
}

function quickFixTimeSlots() {
  Logger.log('🔧 Running quick fix for TimeSlots...');
  
  try {
    setupTimeSlots();
    
    // Verify
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TimeSlots');
    const rowCount = sheet.getLastRow();
    
    if (rowCount > 1) {
      Logger.log('✅ TimeSlots quick fix complete!');
      Logger.log('📊 Sheet has ' + (rowCount - 1) + ' time slot entries');
    } else {
      Logger.log('❌ TimeSlots sheet is still empty after fix');
    }
  } catch (error) {
    Logger.log('❌ Error during quick fix: ' + error.toString());
  }
}

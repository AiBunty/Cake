/**
 * CAKE TAKEAWAY ORDERING & BOOKING SYSTEM
 * Google Apps Script Backend with CRM Integration
 * 
 * This script handles:
 * - Product catalog delivery
 * - Time slot availability
 * - Order creation and management
 * - Payment confirmation
 * - CRM webhook integration for orders
 * - Calendar booking sync
 * - Automated CRM push for bookings
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg',
  API_KEY: PropertiesService.getScriptProperties().getProperty('APPS_SCRIPT_API_KEY'),
  CRM_MODE: PropertiesService.getScriptProperties().getProperty('CRM_MODE') || 'WEBHOOK',
  CRM_WEBHOOK_ORDER_URL: PropertiesService.getScriptProperties().getProperty('CRM_WEBHOOK_ORDER_URL'),
  CRM_WEBHOOK_BOOKING_URL: PropertiesService.getScriptProperties().getProperty('CRM_WEBHOOK_BOOKING_URL'),
  CRM_API_KEY: PropertiesService.getScriptProperties().getProperty('CRM_API_KEY'),
  CRM_AUTH_MODE: PropertiesService.getScriptProperties().getProperty('CRM_AUTH_MODE') || 'BEARER',
  CRM_TIMEOUT_MS: parseInt(PropertiesService.getScriptProperties().getProperty('CRM_TIMEOUT_MS') || '30000'),
  CALENDAR_ID: PropertiesService.getScriptProperties().getProperty('CALENDAR_ID'),
  LOOKBACK_MINUTES: parseInt(PropertiesService.getScriptProperties().getProperty('LOOKBACK_MINUTES') || '180'),
  LOOKAHEAD_DAYS: parseInt(PropertiesService.getScriptProperties().getProperty('LOOKAHEAD_DAYS') || '60'),
};

// ============================================================================
// WEB APP ENTRY POINT
// ============================================================================

function doGet(e) {
  if (!e || !e.parameter) {
    return jsonResponse(
      false,
      null,
      'Invalid request context',
      'doGet must be invoked by an HTTP request with query parameters'
    );
  }

  // Log incoming request for debugging
  Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));
  
  // Special debug route to check API key status
  if (e.parameter.route === 'debug_status') {
    return jsonResponse(true, {
      api_key_configured: !!CONFIG.API_KEY,
      sheet_id: CONFIG.SHEET_ID,
      timestamp: new Date().toISOString(),
      message: CONFIG.API_KEY ? 'API key is configured' : 'API key is NOT configured (setup mode)'
    });
  }
  
  // Check API key - but allow requests without it during setup
  const apiKeyStatus = validateApiKey(e);
  
  if (apiKeyStatus.valid === false && CONFIG.API_KEY) {
    // API key is configured and validation failed
    Logger.log('API key validation failed: ' + apiKeyStatus.reason);
    return jsonResponse(false, null, 'Unauthorized', apiKeyStatus.reason);
  }
  
  // Either no validation needed or validation passed
  if (!apiKeyStatus.valid && !CONFIG.API_KEY) {
    Logger.log('Warning: No API key configured - operating in setup mode');
  }

  const route = e.parameter.route;
  
  try {
    switch (route) {
      case 'products':
        return handleGetProducts();
      case 'timeslots':
        return handleGetTimeSlots(e.parameter.date);
      case 'toppings':
        return handleGetToppings();
      case 'settings':
        return handleGetSettings();
      case 'orders_by_customer':
        return handleGetOrdersByCustomer(e.parameter.email, e.parameter.phone);
      case 'upi_mark_verified':
        return handleUpiMarkVerified({ order_id: e.parameter.order_id });
      default:
        return jsonResponse(false, null, 'Unknown route', route);
    }
  } catch (error) {
    Logger.log('doGet error: ' + error);
    return jsonResponse(false, null, error.toString());
  }
}

function doPost(e) {
  if (!e || !e.parameter || !e.postData || !e.postData.contents) {
    return jsonResponse(
      false,
      null,
      'Invalid request context',
      'doPost must be invoked by an HTTP POST request with JSON body'
    );
  }

  // Log incoming request for debugging
  Logger.log('doPost called with route: ' + e.parameter.route);
  
  // Check API key - but allow requests without it during setup
  const apiKeyStatus = validateApiKey(e);
  
  if (apiKeyStatus.valid === false && CONFIG.API_KEY) {
    // API key is configured and validation failed
    Logger.log('API key validation failed: ' + apiKeyStatus.reason);
    return jsonResponse(false, null, 'Unauthorized', apiKeyStatus.reason);
  }
  
  // Either no validation needed or validation passed
  if (!apiKeyStatus.valid && !CONFIG.API_KEY) {
    Logger.log('Warning: No API key configured - operating in setup mode');
  }

  const route = e.parameter.route;
  
  try {
    const payload = JSON.parse(e.postData.contents);
    
    switch (route) {
      case 'orders_create':
        return handleCreateOrder(payload);
      case 'payments_mark_paid':
        return handleMarkOrderPaid(payload);
      case 'upi_payment_submit':
        return handleUpiPaymentSubmit(payload);
      case 'upi_mark_verified':
        return handleUpiMarkVerified(payload);
      case 'admin_login':
        return handleAdminLogin(payload);
      case 'admin_products_list':
        return handleAdminProductsList(payload);
      case 'admin_product_upsert':
        return handleAdminProductUpsert(payload);
      case 'admin_product_delete':
        return handleAdminProductDelete(payload);
      case 'admin_orders_list':
        return handleAdminOrdersList(payload);
      case 'admin_settings_list':
        return handleAdminSettingsList(payload);
      case 'admin_settings_upsert':
        return handleAdminSettingsUpsert(payload);
      case 'crm_push_order':
        return handleCrmPushOrder(e.parameter.order_id);
      case 'crm_push_booking':
        return handleCrmPushBooking(e.parameter.booking_id);
      default:
        return jsonResponse(false, null, 'Unknown route', route);
    }
  } catch (error) {
    Logger.log('doPost error: ' + error);
    return jsonResponse(false, null, error.toString());
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function validateApiKey(e) {
  const configuredKey = CONFIG.API_KEY;
  const parameters = (e && e.parameter) ? e.parameter : {};
  
  // If no API key is configured, allow all requests (setup mode)
  if (!configuredKey) {
    Logger.log('ℹ️ Setup mode: No API key configured. Accepting all requests.');
    return { valid: true, reason: 'No key configured' };
  }
  
  // API key is configured, check the incoming request
  const providedKey = 
    parameters['x-api-key'] ||
    parameters['api_key'] ||
    (e.postData &&
      e.postData.headers &&
      (e.postData.headers['x-api-key'] ||
        e.postData.headers['X-API-KEY'] ||
        e.postData.headers['api_key']));
  
  if (!providedKey) {
    Logger.log('❌ API key required but not provided');
    return { valid: false, reason: 'API key required' };
  }
  
  if (providedKey !== configuredKey) {
    Logger.log('❌ Invalid API key provided');
    return { valid: false, reason: 'Invalid API key' };
  }
  
  Logger.log('✅ API key validated successfully');
  return { valid: true, reason: 'Valid key' };
}

function parseBoolean(value) {
  if (value === true) return true;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'yes' ||
      normalized === 'y' ||
      normalized === 'on'
    );
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return false;
}

function validateAdminAccess(payload) {
  const settings = getSettings();
  const configuredUsername = settings.admin_username ? settings.admin_username.toString().trim() : '';
  const configuredPassword = settings.admin_password ? settings.admin_password.toString().trim() : '';
  const configuredAdminKey = settings.admin_panel_key ? settings.admin_panel_key.toString().trim() : '';

  const hasUserPass = configuredUsername && configuredPassword;
  const hasLegacyKey = !!configuredAdminKey;

  if (!hasUserPass && !hasLegacyKey) {
    return { ok: true };
  }

  const providedUsername = payload && payload.admin_username ? payload.admin_username.toString().trim() : '';
  const providedPassword = payload && payload.admin_password ? payload.admin_password.toString().trim() : '';

  if (hasUserPass) {
    if (providedUsername === configuredUsername && providedPassword === configuredPassword) {
      return { ok: true };
    }
    return { ok: false, error: 'Invalid admin username or password' };
  }

  const providedKey = payload && payload.admin_key ? payload.admin_key.toString().trim() : '';
  if (!providedKey || providedKey !== configuredAdminKey) {
    return { ok: false, error: 'Invalid admin key' };
  }

  return { ok: true };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

function handleGetProducts() {
  const sheet = getSheet('Products');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    const product = {
      id: row[0].toString(),
      name: row[1],
      description: row[2],
      price_inr: parseFloat(row[3]) || 0,
      image_url: row[4],
      category: row[5] || 'Other',
      is_available: row[6] === true || row[6] === 'TRUE' || row[6] === true,
      sort_order: parseInt(row[7]) || 0,
      allowed_toppings: row[8] ? row[8].toString() : '', // New column for linking toppings
    };
    products.push(product);
  }
  
  return jsonResponse(true, products);
}

function handleGetTimeSlots(date) {
  if (!date) {
    return jsonResponse(false, null, 'Date parameter required');
  }
  
  const sheet = getSheet('TimeSlots');
  const data = sheet.getDataRange().getValues();
  const slots = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    if (row[0].toString() === date || formatDate(row[0]) === date) {
      const slot = {
        date: formatDate(row[0]),
        slot_label: row[1],
        start_time: row[2],
        end_time: row[3],
        max_orders: parseInt(row[4]) || 10,
        is_open: row[5] === true || row[5] === 'TRUE' || row[5] === true,
      };
      
      // Calculate available slots
      const ordersCount = countPaidOrders(slot.date, slot.slot_label);
      slot.available_slots = slot.max_orders - ordersCount;
      
      slots.push(slot);
    }
  }
  
  return jsonResponse(true, slots);
}

function handleGetToppings() {
  const sheet = getSheet('Toppings');
  if (!sheet) {
    return jsonResponse(false, null, 'Toppings sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const toppings = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    const topping = {
      id: row[0].toString(),
      name: row[1],
      description: row[2],
      price_inr: parseFloat(row[3]) || 0,
      icon_emoji: row[4],
      is_available: parseBoolean(row[5]),
      sort_order: parseInt(row[6]) || 0,
    };
    toppings.push(topping);
  }
  
  return jsonResponse(true, toppings);
}

function handleGetSettings() {
  const settings = getSettings();
  return jsonResponse(true, settings);
}

function handleGetOrdersByCustomer(email, phone) {
  if (!email && !phone) {
    return jsonResponse(false, null, 'Email or phone parameter required');
  }
  
  const sheet = getSheet('Orders');
  if (!sheet) {
    return jsonResponse(false, null, 'Orders sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const orders = [];
  
  // Skip header row, iterate through all orders
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    const orderEmail = row[4] ? row[4].toString().trim().toLowerCase() : '';
    const orderPhone = row[3] ? row[3].toString().trim() : '';
    const searchEmail = email ? email.trim().toLowerCase() : '';
    const searchPhone = phone ? phone.trim() : '';
    
    // Match by email or phone
    const emailMatch = searchEmail && orderEmail === searchEmail;
    const phoneMatch = searchPhone && orderPhone === searchPhone;
    
    if (emailMatch || phoneMatch) {
      const order = {
        order_id: row[0].toString(),
        created_at: row[1] ? new Date(row[1]).toISOString() : '',
        customer_name: row[2],
        phone: row[3],
        email: row[4],
        pickup_date: formatDate(row[5]),
        pickup_slot_label: row[6],
        pickup_start_time: row[7],
        pickup_end_time: row[8],
        pickup_timezone: row[9] || 'Asia/Kolkata',
        cart_json: row[10],
        subtotal_inr: parseFloat(row[11]) || 0,
        payment_status: row[12] || 'CREATED',
        razorpay_order_id: row[13] || '',
        razorpay_payment_id: row[14] || '',
        notes: row[21] || '',
        payment_method: row[22] || 'RAZORPAY',
        upi_utr: row[23] || '',
        upi_status: row[24] || '',
        upi_screenshot_url: row[25] || '',
        upi_submitted_at: row[26] || '',
      };
      orders.push(order);
    }
  }
  
  // Sort by created_at descending (newest first)
  orders.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  return jsonResponse(true, orders);
}

function handleAdminLogin(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  return jsonResponse(true, { authenticated: true });
}

function handleAdminProductsList(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  return handleGetProducts();
}

function handleAdminProductUpsert(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  if (!payload || !payload.product || !payload.product.id) {
    return jsonResponse(false, null, 'Invalid payload', 'product with id is required');
  }

  const product = payload.product;
  const sheet = getSheet('Products');
  if (!sheet) {
    return jsonResponse(false, null, 'Products sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const values = [
    product.id.toString().trim(),
    product.name || '',
    product.description || '',
    parseFloat(product.price_inr) || 0,
    product.image_url || '',
    product.category || 'Other',
    parseBoolean(product.is_available),
    parseInt(product.sort_order, 10) || 0,
    product.allowed_toppings || '',
  ];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString() === values[0]) {
      sheet.getRange(i + 1, 1, 1, values.length).setValues([values]);
      return jsonResponse(true, { id: values[0], action: 'updated' });
    }
  }

  sheet.appendRow(values);
  return jsonResponse(true, { id: values[0], action: 'created' });
}

function handleAdminProductDelete(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  if (!payload || !payload.id) {
    return jsonResponse(false, null, 'Invalid payload', 'id is required');
  }

  const id = payload.id.toString();
  const sheet = getSheet('Products');
  if (!sheet) {
    return jsonResponse(false, null, 'Products sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString() === id) {
      sheet.deleteRow(i + 1);
      return jsonResponse(true, { id: id, action: 'deleted' });
    }
  }

  return jsonResponse(false, null, 'Product not found');
}

function handleAdminOrdersList(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  const limit = (payload && payload.limit) ? parseInt(payload.limit, 10) : 200;
  const sheet = getSheet('Orders');
  if (!sheet) {
    return jsonResponse(false, null, 'Orders sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  const orders = [];

  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    orders.push({
      order_id: data[i][0].toString(),
      created_at: data[i][1] ? new Date(data[i][1]).toISOString() : '',
      customer_name: data[i][2],
      phone: data[i][3],
      email: data[i][4],
      pickup_date: formatDate(data[i][5]),
      pickup_slot_label: data[i][6],
      pickup_start_time: data[i][7],
      pickup_end_time: data[i][8],
      pickup_timezone: data[i][9] || 'Asia/Kolkata',
      cart_json: data[i][10],
      subtotal_inr: parseFloat(data[i][11]) || 0,
      payment_status: data[i][12] || 'CREATED',
      notes: data[i][21] || '',
      payment_method: data[i][22] || 'RAZORPAY',
      upi_utr: data[i][23] || '',
      upi_status: data[i][24] || '',
      upi_screenshot_url: data[i][25] || '',
      upi_submitted_at: data[i][26] || '',
    });
  }

  orders.sort(function (a, b) {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return jsonResponse(true, orders.slice(0, Math.max(1, limit)));
}

function handleAdminSettingsList(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  return jsonResponse(true, getSettings());
}

function handleAdminSettingsUpsert(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  if (!payload || !payload.key) {
    return jsonResponse(false, null, 'Invalid payload', 'key is required');
  }

  const key = payload.key.toString().trim();
  const value = payload.value === undefined || payload.value === null ? '' : payload.value.toString();
  if (!key) {
    return jsonResponse(false, null, 'Invalid payload', 'key cannot be empty');
  }

  const sheet = getSheet('Settings');
  if (!sheet) {
    return jsonResponse(false, null, 'Settings sheet not found');
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return jsonResponse(true, { key: key, value: value, action: 'updated' });
    }
  }

  sheet.appendRow([key, value]);
  return jsonResponse(true, { key: key, value: value, action: 'created' });
}

function handleCreateOrder(payload) {
  if (!payload || typeof payload !== 'object') {
    return jsonResponse(false, null, 'Invalid payload', 'Order payload is required');
  }

  if (!payload.pickup_date || !payload.pickup_slot_label) {
    return jsonResponse(false, null, 'Missing required fields', 'pickup_date and pickup_slot_label are required');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    // Validate slot availability
    const ordersCount = countPaidOrders(payload.pickup_date, payload.pickup_slot_label);
    const slot = getSlotInfo(payload.pickup_date, payload.pickup_slot_label);
    
    if (!slot) {
      return jsonResponse(false, null, 'Invalid time slot');
    }
    
    if (!slot.is_open) {
      return jsonResponse(false, null, 'Time slot is closed');
    }
    
    if (ordersCount >= slot.max_orders) {
      return jsonResponse(false, null, 'Time slot is full');
    }
    
    // Create order
    const orderId = 'ORD-' + Date.now();
    const timestamp = new Date().toISOString();
    
    const sheet = getSheet('Orders');
    const paymentMethod = payload.payment_method === 'UPI' ? 'UPI' : 'RAZORPAY';

    sheet.appendRow([
      orderId,
      timestamp,
      payload.customer_name,
      payload.phone,
      payload.email,
      payload.pickup_date,
      payload.pickup_slot_label,
      payload.pickup_start_time,
      payload.pickup_end_time,
      payload.pickup_timezone,
      payload.cart_json,
      payload.subtotal_inr,
      'CREATED', // payment_status
      '', // razorpay_order_id
      '', // razorpay_payment_id
      '', // razorpay_signature
      'PENDING', // crm_push_status
      '', // crm_push_error
      '', // crm_contact_id
      '', // crm_opportunity_id
      '', // invoice_receipt_url
      payload.notes || '',
      paymentMethod, // payment_method
      '', // upi_utr
      '', // upi_status
      '', // upi_screenshot_url
      '', // upi_submitted_at
    ]);
    
    return jsonResponse(true, { order_id: orderId, created_at: timestamp });
  } finally {
    lock.releaseLock();
  }
}

function handleMarkOrderPaid(payload) {
  if (!payload || !payload.order_id) {
    return jsonResponse(false, null, 'Invalid payload', 'order_id is required');
  }

  const sheet = getSheet('Orders');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.order_id) {
      // Update payment status
      sheet.getRange(i + 1, 13).setValue('PAID');
      sheet.getRange(i + 1, 23).setValue('RAZORPAY');
      sheet.getRange(i + 1, 14).setValue(payload.razorpay_order_id);
      sheet.getRange(i + 1, 15).setValue(payload.razorpay_payment_id);
      sheet.getRange(i + 1, 16).setValue(payload.razorpay_signature);
      
      // Push to CRM immediately
      const pushResult = pushOrderToCRM(payload.order_id);
      
      return jsonResponse(true, { 
        order_id: payload.order_id, 
        payment_status: 'PAID',
        crm_push_status: pushResult.ok ? 'SUCCESS' : 'FAILED'
      });
    }
  }
  
  return jsonResponse(false, null, 'Order not found');
}

function handleUpiPaymentSubmit(payload) {
  if (!payload || !payload.order_id || !payload.upi_utr) {
    return jsonResponse(false, null, 'Invalid payload', 'order_id and upi_utr are required');
  }

  const sheet = getSheet('Orders');
  if (!sheet) {
    return jsonResponse(false, null, 'Orders sheet not found');
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.order_id) {
      let screenshotUrl = '';

      if (payload.screenshot_data_url) {
        const screenshotResult = saveUpiScreenshot(
          payload.order_id,
          payload.screenshot_data_url,
          payload.screenshot_file_name
        );
        if (screenshotResult.ok) {
          screenshotUrl = screenshotResult.url || '';
        }
      }

      sheet.getRange(i + 1, 13).setValue('PENDING_VERIFICATION'); // payment_status
      sheet.getRange(i + 1, 23).setValue('UPI'); // payment_method
      sheet.getRange(i + 1, 24).setValue(payload.upi_utr.toString().trim()); // upi_utr
      sheet.getRange(i + 1, 25).setValue('RECEIVED'); // upi_status
      sheet.getRange(i + 1, 26).setValue(screenshotUrl); // upi_screenshot_url
      sheet.getRange(i + 1, 27).setValue(new Date().toISOString()); // upi_submitted_at

      appendUpiPaymentLog({
        order_id: payload.order_id,
        amount: parseFloat(data[i][11]) || 0,
        upi_utr: payload.upi_utr.toString().trim(),
        screenshot_url: screenshotUrl,
        status: 'RECEIVED',
      });

      const pushResult = pushOrderToCRM(payload.order_id, { allowUnpaid: true });

      return jsonResponse(true, {
        order_id: payload.order_id,
        payment_method: 'UPI',
        upi_status: 'RECEIVED',
        payment_status: 'PENDING_VERIFICATION',
        upi_screenshot_url: screenshotUrl,
        crm_push_status: pushResult.ok ? 'SUCCESS' : 'FAILED',
      });
    }
  }

  return jsonResponse(false, null, 'Order not found');
}

function handleUpiMarkVerified(payload) {
  const access = validateAdminAccess(payload || {});
  if (!access.ok) {
    return jsonResponse(false, null, 'Unauthorized', access.error);
  }

  if (!payload || !payload.order_id) {
    return jsonResponse(false, null, 'Invalid payload', 'order_id is required');
  }

  const sheet = getSheet('Orders');
  if (!sheet) {
    return jsonResponse(false, null, 'Orders sheet not found');
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === payload.order_id) {
      sheet.getRange(i + 1, 13).setValue('PAID'); // payment_status
      sheet.getRange(i + 1, 23).setValue('UPI'); // payment_method
      sheet.getRange(i + 1, 25).setValue('VERIFIED'); // upi_status

      appendUpiPaymentLog({
        order_id: payload.order_id,
        amount: parseFloat(data[i][11]) || 0,
        upi_utr: data[i][23] || '',
        screenshot_url: data[i][25] || '',
        status: 'VERIFIED',
      });

      const pushResult = pushOrderToCRM(payload.order_id);

      return jsonResponse(true, {
        order_id: payload.order_id,
        payment_status: 'PAID',
        upi_status: 'VERIFIED',
        crm_push_status: pushResult.ok ? 'SUCCESS' : 'FAILED',
      });
    }
  }

  return jsonResponse(false, null, 'Order not found');
}

function saveUpiScreenshot(orderId, screenshotDataUrl, screenshotFileName) {
  try {
    if (!screenshotDataUrl || typeof screenshotDataUrl !== 'string') {
      return { ok: false, error: 'Screenshot data missing' };
    }

    const settings = getSettings();
    const folderId = settings.upi_screenshot_folder_id ? settings.upi_screenshot_folder_id.toString().trim() : '';
    const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();

    let mimeType = 'image/png';
    let base64Part = screenshotDataUrl;

    const dataUrlMatch = screenshotDataUrl.match(/^data:(.*?);base64,(.*)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1] || mimeType;
      base64Part = dataUrlMatch[2] || '';
    }

    if (!base64Part) {
      return { ok: false, error: 'Invalid screenshot payload' };
    }

    const extension = mimeType.indexOf('jpeg') >= 0 ? 'jpg' : 'png';
    const filename = screenshotFileName || ('upi_' + orderId + '_' + Date.now() + '.' + extension);
    const bytes = Utilities.base64Decode(base64Part);
    const blob = Utilities.newBlob(bytes, mimeType, filename);
    const file = folder.createFile(blob);

    return { ok: true, url: file.getUrl(), file_id: file.getId() };
  } catch (error) {
    Logger.log('saveUpiScreenshot error: ' + error);
    return { ok: false, error: error.toString() };
  }
}

function appendUpiPaymentLog(entry) {
  const sheet = getSheet('UPIPayments');
  if (!sheet) {
    return;
  }

  sheet.appendRow([
    entry.order_id || '',
    new Date().toISOString(),
    entry.amount || 0,
    entry.upi_utr || '',
    entry.screenshot_url || '',
    entry.status || '',
  ]);
}

function handleCrmPushOrder(orderId) {
  if (!orderId) {
    return jsonResponse(false, null, 'Order ID required');
  }
  
  const result = pushOrderToCRM(orderId);
  return jsonResponse(result.ok, result.data, result.error, result.details);
}

function handleCrmPushBooking(bookingId) {
  if (!bookingId) {
    return jsonResponse(false, null, 'Booking ID required');
  }
  
  const result = pushBookingToCRM(bookingId);
  return jsonResponse(result.ok, result.data, result.error, result.details);
}

// ============================================================================
// CRM INTEGRATION
// ============================================================================

function pushOrderToCRM(orderId, options) {
  try {
    const opts = options || {};
    const order = getOrderById(orderId);
    if (!order) {
      return { ok: false, error: 'Order not found' };
    }
    
    if (order.payment_status !== 'PAID' && !opts.allowUnpaid) {
      return { ok: false, error: 'Order not paid yet' };
    }
    
    const crmPayload = buildOrderCrmPayload(order);
    const result = sendToCRM(CONFIG.CRM_WEBHOOK_ORDER_URL, crmPayload);
    
    // Update CRM push status in sheet
    updateOrderCrmStatus(orderId, result.ok ? 'SUCCESS' : 'FAILED', result.error || '', result.data);
    
    return result;
  } catch (error) {
    Logger.log('pushOrderToCRM error: ' + error);
    updateOrderCrmStatus(orderId, 'FAILED', error.toString(), null);
    return { ok: false, error: error.toString() };
  }
}

function pushBookingToCRM(bookingId) {
  try {
    const booking = getBookingById(bookingId);
    if (!booking) {
      return { ok: false, error: 'Booking not found' };
    }
    
    const crmPayload = buildBookingCrmPayload(booking);
    const result = sendToCRM(CONFIG.CRM_WEBHOOK_BOOKING_URL, crmPayload);
    
    // Update CRM push status in sheet
    updateBookingCrmStatus(bookingId, result.ok ? 'SUCCESS' : 'FAILED', result.error || '', result.data);
    
    return result;
  } catch (error) {
    Logger.log('pushBookingToCRM error: ' + error);
    updateBookingCrmStatus(bookingId, 'FAILED', error.toString(), null);
    return { ok: false, error: error.toString() };
  }
}

function sendToCRM(url, payload) {
  if (!url) {
    return { ok: false, error: 'CRM webhook URL not configured' };
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authentication header based on mode
    if (CONFIG.CRM_AUTH_MODE === 'BEARER' && CONFIG.CRM_API_KEY) {
      headers['Authorization'] = 'Bearer ' + CONFIG.CRM_API_KEY;
    } else if (CONFIG.CRM_AUTH_MODE === 'X-API-KEY' && CONFIG.CRM_API_KEY) {
      headers['x-api-key'] = CONFIG.CRM_API_KEY;
    }
    
    const options = {
      method: 'post',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      return { ok: true, data: { responseCode, responseText } };
    } else {
      return { ok: false, error: 'CRM returned error ' + responseCode, details: responseText };
    }
  } catch (error) {
    Logger.log('sendToCRM error: ' + error);
    return { ok: false, error: error.toString() };
  }
}

function buildOrderCrmPayload(order) {
  if (!order || typeof order !== 'object') {
    throw new Error('Order is required to build CRM payload');
  }

  if (!order.customer_name) {
    throw new Error('Order customer_name is required');
  }

  const names = splitName(order.customer_name);
  const pickupDateTime = new Date(order.pickup_date + 'T' + order.pickup_start_time);
  const timeFields = buildTimeFields(pickupDateTime);
  const settings = getSettings();
  const orderNotes = [order.notes || ''];

  if (order.payment_method) {
    orderNotes.push('Payment Method: ' + order.payment_method);
  }

  if (order.upi_utr) {
    orderNotes.push('UPI UTR: ' + order.upi_utr);
  }

  if (order.upi_status) {
    orderNotes.push('UPI Status: ' + order.upi_status);
  }

  const mergedNotes = orderNotes.filter(Boolean).join(' | ');
  
  return {
    contact: {
      first_name: names.first,
      last_name: names.last,
      email: order.email,
      phone: order.phone,
      contact_type: settings.contact_type || 'Customer',
      business_name: '',
      gst_no: '',
      state: '',
      street_address: '',
      profile_image: '',
      date_of_birth: '',
      contact_source: 'Cake Website Order',
      postal_code: '',
    },
    opportunity: {
      opportunity_name: 'Cake Order - ' + order.order_id,
      lead_value: order.subtotal_inr,
      assigned_to_staff: settings.assigned_to_staff || '',
      opportunity_source: 'Website',
      notes: mergedNotes,
    },
    calendar: {
      appointment_date: order.pickup_date,
      appointment_start_time: order.pickup_start_time,
      appointment_end_time: order.pickup_end_time,
      appointment_timezone: order.pickup_timezone,
    },
    time: timeFields,
    sf: {
      p_name: 'Cake Order',
      p_value: order.subtotal_inr,
      p_type: 'Takeaway',
      inv_paid: order.payment_status === 'PAID' ? 'YES' : 'NO',
      inv_value: order.subtotal_inr,
      inv_receipt: order.invoice_receipt_url || '',
      inv_date: order.created_at.split('T')[0],
      pay: order.payment_method || '',
      failed: '',
    },
    notes: mergedNotes,
    meta: {
      type: 'order',
      source: 'Cake Website',
      internal_id: order.order_id,
      raw: order,
    },
  };
}

function buildBookingCrmPayload(booking) {
  if (!booking || typeof booking !== 'object') {
    throw new Error('Booking is required to build CRM payload');
  }

  if (!booking.customer_name) {
    throw new Error('Booking customer_name is required');
  }

  const names = splitName(booking.customer_name);
  const bookingDateTime = new Date(booking.required_date + 'T' + booking.required_start_time);
  const timeFields = buildTimeFields(bookingDateTime);
  const settings = getSettings();
  
  return {
    contact: {
      first_name: names.first,
      last_name: names.last,
      email: booking.email,
      phone: booking.phone,
      contact_type: settings.contact_type || 'Lead',
      business_name: '',
      gst_no: '',
      state: '',
      street_address: '',
      profile_image: '',
      date_of_birth: '',
      contact_source: 'Cake Calendar Booking',
      postal_code: '',
    },
    opportunity: {
      opportunity_name: 'Cake Booking - ' + booking.booking_id,
      lead_value: 0,
      assigned_to_staff: settings.assigned_to_staff || '',
      opportunity_source: 'Google Calendar',
    },
    calendar: {
      appointment_date: booking.required_date,
      appointment_start_time: booking.required_start_time,
      appointment_end_time: booking.required_end_time,
      appointment_timezone: booking.timezone,
    },
    time: timeFields,
    sf: {
      p_name: 'Cake Booking',
      p_value: '',
      p_type: 'Booking',
      inv_paid: 'NO',
      inv_value: '',
      inv_receipt: '',
      inv_date: booking.created_at.split('T')[0],
      pay: '',
      failed: '',
    },
    meta: {
      type: 'booking',
      source: 'Google Calendar',
      internal_id: booking.booking_id,
      raw: booking,
    },
  };
}

function buildTimeFields(dateTime) {
  if (!dateTime) {
    throw new Error('dateTime is required to build time fields');
  }

  if (!(dateTime instanceof Date) || isNaN(dateTime.getTime())) {
    throw new Error('Invalid dateTime provided to buildTimeFields');
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const second = ('0' + dateTime.getSeconds()).slice(-2);
  const minute = ('0' + dateTime.getMinutes()).slice(-2);
  const hour24 = dateTime.getHours();
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const day = ('0' + dateTime.getDate()).slice(-2);
  const month = ('0' + (dateTime.getMonth() + 1)).slice(-2);
  const year = dateTime.getFullYear();
  
  return {
    second: second,
    minute: minute,
    hour_24h_format: ('0' + hour24).slice(-2),
    hour_am_pm_format: hour12.toString(),
    time_24h_format: ('0' + hour24).slice(-2) + ':' + minute,
    time_am_pm_format: hour12 + ':' + minute + ' ' + ampm,
    am_pm: ampm,
    day: day,
    day_in_english: days[dateTime.getDay()],
    month: month,
    month_in_english: months[dateTime.getMonth()],
    year: year.toString(),
    year_last_2_digit: year.toString().slice(-2),
    date_us_format: month + '/' + day + '/' + year,
    date_in_format: day + '-' + month + '-' + year,
  };
}

// ============================================================================
// CALENDAR BOOKING SYNC
// ============================================================================

function syncCalendarBookings() {
  if (!CONFIG.CALENDAR_ID) {
    Logger.log('Calendar ID not configured');
    return;
  }
  
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('Could not acquire lock for calendar sync');
    return;
  }
  
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    if (!calendar) {
      Logger.log('Calendar not found: ' + CONFIG.CALENDAR_ID);
      return;
    }
    
    const now = new Date();
    const startTime = new Date(now.getTime() - CONFIG.LOOKBACK_MINUTES * 60 * 1000);
    const endTime = new Date(now.getTime() + CONFIG.LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
    
    const events = calendar.getEvents(startTime, endTime);
    Logger.log('Found ' + events.length + ' calendar events');
    
    for (const event of events) {
      try {
        syncCalendarEvent(event);
      } catch (error) {
        Logger.log('Error syncing event ' + event.getId() + ': ' + error);
      }
    }
  } finally {
    lock.releaseLock();
  }
}

function syncCalendarEvent(event) {
  if (!event || typeof event.getId !== 'function') {
    throw new Error('Valid calendar event is required');
  }

  const eventId = event.getId();
  const sheet = getSheet('CalendarBookings');
  const data = sheet.getDataRange().getValues();
  
  // Check if event already exists
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === eventId) { // event_id column
      rowIndex = i + 1;
      break;
    }
  }
  
  // Parse event details
  const description = event.getDescription();
  const title = event.getTitle();
  const startTime = event.getStartTime();
  const endTime = event.getEndTime();
  
  const parsedDetails = parseEventDescription(description, title);
  
  const booking = {
    booking_id: rowIndex > 0 ? data[rowIndex - 1][0] : 'BKG-' + Date.now(),
    created_at: rowIndex > 0 ? data[rowIndex - 1][1] : new Date().toISOString(),
    event_id: eventId,
    event_status: event.getMyStatus().toString(),
    customer_name: parsedDetails.name,
    phone: parsedDetails.phone,
    email: parsedDetails.email,
    required_date: formatDate(startTime),
    required_start_time: formatTime(startTime),
    required_end_time: formatTime(endTime),
    timezone: Session.getScriptTimeZone(),
    notes: parsedDetails.notes,
    source: 'WEBSITE_EMBED',
    crm_push_status: rowIndex > 0 ? data[rowIndex - 1][13] : 'PENDING',
    crm_push_error: '',
    crm_contact_id: rowIndex > 0 ? data[rowIndex - 1][15] : '',
    crm_opportunity_id: rowIndex > 0 ? data[rowIndex - 1][16] : '',
  };
  
  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 1, 1, 17).setValues([[
      booking.booking_id,
      booking.created_at,
      booking.event_id,
      booking.event_status,
      booking.customer_name,
      booking.phone,
      booking.email,
      booking.required_date,
      booking.required_start_time,
      booking.required_end_time,
      booking.timezone,
      booking.notes,
      booking.source,
      booking.crm_push_status,
      booking.crm_push_error,
      booking.crm_contact_id,
      booking.crm_opportunity_id,
    ]]);
  } else {
    // Insert new row
    sheet.appendRow([
      booking.booking_id,
      booking.created_at,
      booking.event_id,
      booking.event_status,
      booking.customer_name,
      booking.phone,
      booking.email,
      booking.required_date,
      booking.required_start_time,
      booking.required_end_time,
      booking.timezone,
      booking.notes,
      booking.source,
      booking.crm_push_status,
      booking.crm_push_error,
      booking.crm_contact_id,
      booking.crm_opportunity_id,
    ]);
  }
  
  // Push to CRM if pending
  if (booking.crm_push_status === 'PENDING' && booking.customer_name && booking.email) {
    pushBookingToCRM(booking.booking_id);
  }
}

function parseEventDescription(description, title) {
  const result = {
    name: '',
    phone: '',
    email: '',
    notes: description || '',
  };
  
  if (!description) {
    return result;
  }
  
  // Try to extract name
  const nameMatch = description.match(/name[:\s]+([^\n]+)/i);
  if (nameMatch) result.name = nameMatch[1].trim();
  
  // Try to extract phone
  const phoneMatch = description.match(/phone[:\s]+([^\n]+)/i);
  if (phoneMatch) result.phone = phoneMatch[1].trim();
  
  // Try to extract email
  const emailMatch = description.match(/email[:\s]+([^\n]+)/i);
  if (emailMatch) result.email = emailMatch[1].trim();
  
  return result;
}

// ============================================================================
// RETRY FAILED PUSHES
// ============================================================================

function retryFailedOrderPushes() {
  const sheet = getSheet('Orders');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const paymentStatus = data[i][12];
    const crmPushStatus = data[i][16];
    const orderId = data[i][0];
    
    if (paymentStatus === 'PAID' && crmPushStatus === 'FAILED') {
      Logger.log('Retrying CRM push for order: ' + orderId);
      pushOrderToCRM(orderId);
    }
  }
}

function retryFailedBookingPushes() {
  const sheet = getSheet('CalendarBookings');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const crmPushStatus = data[i][13];
    const bookingId = data[i][0];
    const customerName = data[i][4];
    const email = data[i][6];
    
    if (crmPushStatus === 'FAILED' && customerName && email) {
      Logger.log('Retrying CRM push for booking: ' + bookingId);
      pushBookingToCRM(bookingId);
    }
  }
}

// ============================================================================
// TRIGGER INSTALLATION
// ============================================================================

function installTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger);
  }
  
  // Install calendar sync trigger (every 5 minutes)
  ScriptApp.newTrigger('syncCalendarBookings')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  // Install retry trigger (every hour)
  ScriptApp.newTrigger('retryFailedOrderPushes')
    .timeBased()
    .everyHours(1)
    .create();
  
  ScriptApp.newTrigger('retryFailedBookingPushes')
    .timeBased()
    .everyHours(1)
    .create();
  
  Logger.log('Triggers installed successfully');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  return ss.getSheetByName(sheetName);
}

function getSettings() {
  try {
    const sheet = getSheet('Settings');
    if (!sheet) return {};
    
    const data = sheet.getDataRange().getValues();
    const settings = {};
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        settings[data[i][0]] = data[i][1];
      }
    }
    
    return settings;
  } catch (error) {
    Logger.log('getSettings error: ' + error);
    return {};
  }
}

function countPaidOrders(date, slotLabel) {
  const sheet = getSheet('Orders');
  const data = sheet.getDataRange().getValues();
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    const orderDate = formatDate(data[i][5]);
    const orderSlot = data[i][6];
    const paymentStatus = data[i][12];
    
    if (orderDate === date && orderSlot === slotLabel && paymentStatus === 'PAID') {
      count++;
    }
  }
  
  return count;
}

function getSlotInfo(date, slotLabel) {
  const sheet = getSheet('TimeSlots');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (formatDate(data[i][0]) === date && data[i][1] === slotLabel) {
      return {
        max_orders: parseInt(data[i][4]) || 10,
        is_open: data[i][5] === true || data[i][5] === 'TRUE',
      };
    }
  }
  
  return null;
}

function getOrderById(orderId) {
  const sheet = getSheet('Orders');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      return {
        order_id: data[i][0],
        created_at: data[i][1],
        customer_name: data[i][2],
        phone: data[i][3],
        email: data[i][4],
        pickup_date: formatDate(data[i][5]),
        pickup_slot_label: data[i][6],
        pickup_start_time: data[i][7],
        pickup_end_time: data[i][8],
        pickup_timezone: data[i][9],
        cart_json: data[i][10],
        subtotal_inr: parseFloat(data[i][11]) || 0,
        payment_status: data[i][12],
        razorpay_order_id: data[i][13],
        razorpay_payment_id: data[i][14],
        razorpay_signature: data[i][15],
        crm_push_status: data[i][16],
        crm_push_error: data[i][17],
        crm_contact_id: data[i][18],
        crm_opportunity_id: data[i][19],
        invoice_receipt_url: data[i][20],
        notes: data[i][21],
        payment_method: data[i][22] || 'RAZORPAY',
        upi_utr: data[i][23] || '',
        upi_status: data[i][24] || '',
        upi_screenshot_url: data[i][25] || '',
        upi_submitted_at: data[i][26] || '',
      };
    }
  }
  
  return null;
}

function getBookingById(bookingId) {
  const sheet = getSheet('CalendarBookings');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      return {
        booking_id: data[i][0],
        created_at: data[i][1],
        event_id: data[i][2],
        event_status: data[i][3],
        customer_name: data[i][4],
        phone: data[i][5],
        email: data[i][6],
        required_date: formatDate(data[i][7]),
        required_start_time: data[i][8],
        required_end_time: data[i][9],
        timezone: data[i][10],
        notes: data[i][11],
        source: data[i][12],
        crm_push_status: data[i][13],
        crm_push_error: data[i][14],
        crm_contact_id: data[i][15],
        crm_opportunity_id: data[i][16],
      };
    }
  }
  
  return null;
}

function updateOrderCrmStatus(orderId, status, error, responseData) {
  const sheet = getSheet('Orders');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      sheet.getRange(i + 1, 17).setValue(status);
      sheet.getRange(i + 1, 18).setValue(error);
      
      if (responseData && responseData.contact_id) {
        sheet.getRange(i + 1, 19).setValue(responseData.contact_id);
      }
      if (responseData && responseData.opportunity_id) {
        sheet.getRange(i + 1, 20).setValue(responseData.opportunity_id);
      }
      
      break;
    }
  }
}

function updateBookingCrmStatus(bookingId, status, error, responseData) {
  const sheet = getSheet('CalendarBookings');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      sheet.getRange(i + 1, 14).setValue(status);
      sheet.getRange(i + 1, 15).setValue(error);
      
      if (responseData && responseData.contact_id) {
        sheet.getRange(i + 1, 16).setValue(responseData.contact_id);
      }
      if (responseData && responseData.opportunity_id) {
        sheet.getRange(i + 1, 17).setValue(responseData.opportunity_id);
      }
      
      break;
    }
  }
}

function splitName(fullName) {
  if (!fullName) return { first: '', last: '' };
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], last: '' };
  } else {
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const hours = ('0' + d.getHours()).slice(-2);
  const minutes = ('0' + d.getMinutes()).slice(-2);
  return `${hours}:${minutes}`;
}

function jsonResponse(ok, data, error, details) {
  const response = { ok: ok };
  if (data !== null && data !== undefined) response.data = data;
  if (error) response.error = error;
  if (details) response.details = details;
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

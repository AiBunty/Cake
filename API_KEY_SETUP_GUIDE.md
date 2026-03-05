# 🔐 API Key Configuration Guide

## Overview

Your Apps Script now supports **two modes**:

1. **Setup Mode** (No API key configured) - Accepts all requests with no authentication
2. **Production Mode** (API key configured) - Only accepts requests with valid API key

---

## Step 1: Test Current Status

Test if the Apps Script is working:

```bash
# Windows PowerShell
$url = "https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec?route=debug_status"
$response = Invoke-RestMethod -Uri $url
Write-Output ($response | ConvertTo-Json)
```

**Expected Result:**
```json
{
  "ok": true,
  "data": {
    "api_key_configured": false,
    "sheet_id": "1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg",
    "message": "API key is NOT configured (setup mode)"
  }
}
```

---

## Step 2: Test Toppings API

Test if toppings are working (no API key needed currently):

```bash
# Windows PowerShell
$url = "https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec?route=toppings"
$response = Invoke-RestMethod -Uri $url
Write-Output ($response | ConvertTo-Json -Depth 10)
```

**Expected Result:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "top001",
      "name": "Chocolate Chips",
      "description": "...",
      "price_inr": 50,
      "icon_emoji": "🍫",
      "is_available": true,
      "sort_order": 1
    }
  ]
}
```

If you get JSON (not HTML), **toppings are now working!** 🎉

---

## Step 3: Configure API Key (Optional but Recommended)

Once toppings are working, add security with an API key:

### 3a. Set Script Properties

1. Open **Google Apps Script Editor**
2. Click **⚙️ Project Settings** (left sidebar)
3. Scroll to **Script Properties**
4. Click **Add script property** and add:

| Property | Value | Description |
|----------|-------|-------------|
| `APPS_SCRIPT_API_KEY` | `your-secure-key-123` | Use a strong, random key |

**Example strong key:**
```
cake_api_key_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c
```

### 3b. Update `.env.local`

Make sure your `.env.local` matches the key you just created:

```bash
APPS_SCRIPT_API_KEY=your-secure-key-123
```

### 3c. Re-deploy Apps Script

1. Click **Deploy → New deployment**
2. Select **Web app**
3. Click **Deploy**
4. Authorize permissions

Your new deployment will now read the API key from Script Properties.

---

## Step 4: Test with API Key

Once the key is configured, test it:

```bash
# With API key (should work)
$url = "https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec?route=toppings&x-api-key=your-secure-key-123"
$response = Invoke-RestMethod -Uri $url
Write-Output "With key: OK"

# Without API key (should fail)
$url = "https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec?route=toppings"
try {
  $response = Invoke-RestMethod -Uri $url
  Write-Output "Without key: OK"
} catch {
  Write-Output "Without key: Unauthorized (expected)"
}
```

---

## Troubleshooting

### Issue: Still getting 302 HTML response

**Solution:**
1. Verify you deployed as **Web app** (not as executable script)
2. Check that **Who has access** is set to **Anyone**
3. Clear browser cache and try again
4. Check execution logs in Apps Script for errors

### Issue: API key not working

**Solution:**
1. Verify Script Properties matches `.env.local` exactly (case-sensitive)
2. Check you're using `x-api-key` parameter (lowercase)
3. Verify the deployment has the new Script Properties set
4. Check Apps Script execution logs for validation errors

### Issue: "API key required" but I didn't set one

**Solution:**
1. Go to **Project Settings**
2. Check if `APPS_SCRIPT_API_KEY` property exists
3. If it exists but is empty, **delete it**
4. Re-deploy the script
5. Now it will be in setup mode again

---

## Architecture

### Setup Mode (No API Key)
```
Client Request
    ↓
validateApiKey() → CONFIG.API_KEY is null/empty
    ↓
Return true (allow request)
    ↓
Process route (toppings, products, etc.)
    ↓
Return JSON response
```

### Production Mode (With API Key)
```
Client Request + x-api-key parameter
    ↓
validateApiKey() → CONFIG.API_KEY is set
    ↓
Check if provided key matches configured key
    ↓
If match: return true (allow request)
If no match: return false (reject request)
    ↓
Process route or return 'Unauthorized'
    ↓
Return JSON response
```

---

## Current Status (Check with debug_status)

Visit this URL to check your current configuration:

```
https://script.google.com/macros/s/AKfycbxajUCYTR9zuHoZWqjkPUFatnMw8UW_ZIde6LP0zbs2UEDzGwiuIGE6j5CybaX-iVp8/exec?route=debug_status
```

This shows whether API key protection is enabled or you're in setup mode.

---

## Best Practices

1. **Development:** Keep it in setup mode (no API key) for easier testing
2. **Production:** Always set an API key and update `.env.local`
3. **Security:** Use a strong, random API key (min 32 characters)
4. **Deployment:** Always create **NEW deployments** when changing Script Properties
5. **Logging:** Check Apps Script execution logs to debug issues

---

## Summary

✅ API key is **optional** - script works without it  
✅ Setup mode enabled - all requests accepted  
✅ Production mode available - just configure API key  
✅ Logging enabled - check execution logs for debugging  

**Current Mode:** Setup Mode (no API key configured)  
**Next Step:** Test toppings endpoint to confirm it works!

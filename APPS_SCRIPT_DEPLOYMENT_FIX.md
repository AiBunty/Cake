# 🚨 APPS SCRIPT DEPLOYMENT FIX - Toppings Not Working

## Problem Identified

Your Apps Script is returning **302 redirects with HTML** instead of JSON responses. This causes the "No toppings available" error.

**Test Result:**
```
Status: 302
Content-Type: text/html; charset=UTF-8
<HTML><TITLE>Moved Temporarily</TITLE>...
```

This means the deployment configuration is incorrect.

---

## ✅ Solution: Proper Apps Script Deployment

### Step 1: Open Apps Script Editor

1. Go to your Google Sheet
2. Click **Extensions → Apps Script**
3. You should see your `Code.gs` file

### Step 2: Configure Script Properties

1. In Apps Script editor, click **Project Settings** (⚙️ icon on the left)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Add these properties:

| Property Name | Value | Description |
|--------------|--------|-------------|
| `SHEET_ID` | `1Mn4XSmtzInSEqwwqYYyALL5EhywkfenlSoHapQG01Pg` | Your Google Sheet ID |
| `APPS_SCRIPT_API_KEY` | `your-secret-key-123` | **MUST MATCH** `.env.local` |

**CRITICAL:** The `APPS_SCRIPT_API_KEY` in Script Properties **MUST EXACTLY MATCH** the one in your `.env.local` file!

### Step 3: Deploy as Web App (**MOST IMPORTANT**)

1. Click **Deploy → New deployment** (top right)
2. Click **⚙️ Settings icon** next to "Select type"
3. Choose **Web app**
4. Configure these settings:

   ```
   Description: Cake API v1.0
   Execute as: Me (YOUR_EMAIL@gmail.com)
   Who has access: Anyone    ← CRITICAL! Must be "Anyone"
   ```

5. Click **Deploy**
6. **Authorize access** when prompted:
   - Click **Review Permissions**
   - Select your Google account
   - Click **Advanced** (if warning appears)
   - Click **Go to [Your Project Name] (unsafe)**
   - Click **Allow**

7. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/AKfycb.../exec`)

### Step 4: Update `.env.local`

Replace the URL in your `.env.local`:

```bash
NEXT_PUBLIC_APPS_SCRIPT_BASE_URL=<PASTE_YOUR_NEW_WEB_APP_URL_HERE>
APPS_SCRIPT_API_KEY=your-secret-key-123
```

**Important:** Make sure the API key here matches the one in Script Properties!

### Step 5: Test the Deployment

Open your browser and visit:

```
YOUR_WEB_APP_URL?route=toppings&x-api-key=your-secret-key-123
```

**Expected Result:** JSON response like this:
```json
{
  "ok": true,
  "data": [
    {
      "id": "top001",
      "name": "Chocolate Chips",
      "price_inr": 50,
      "is_available": true
    }
  ]
}
```

**If you get HTML/redirect:** The deployment settings are still wrong. Repeat Step 3.

---

## 🔍 Common Deployment Mistakes

### ❌ Mistake 1: "Who has access" set to "Only myself"
**Symptom:** 302 redirect to Google login page  
**Fix:** Set to "Anyone" in deployment settings

### ❌ Mistake 2: API Key mismatch
**Symptom:** "Unauthorized" or "Invalid API key"  
**Fix:** Ensure Script Properties `APPS_SCRIPT_API_KEY` matches `.env.local`

### ❌ Mistake 3: Using old deployment URL
**Symptom:** Old code runs, changes not visible  
**Fix:** Always create "New deployment" (not "Manage deployments")

### ❌ Mistake 4: Not authorizing permissions
**Symptom:** Permission error or blank response  
**Fix:** Click through all authorization prompts

---

## 📋 Verification Checklist

Before testing your website, verify:

- [ ] Script Properties configured with correct SHEET_ID and APPS_SCRIPT_API_KEY
- [ ] Deployment set to "Execute as: Me"
- [ ] Deployment set to "Who has access: Anyone"
- [ ] Permissions authorized (clicked "Allow" in OAuth screen)
- [ ] New Web App URL copied to `.env.local`
- [ ] API key in `.env.local` matches Script Properties
- [ ] Direct URL test returns JSON (not HTML)

---

## 🧪 Testing After Deployment

### Test 1: Direct API Call

```bash
# PowerShell
$url = "YOUR_WEB_APP_URL?route=toppings&x-api-key=your-secret-key-123"
Invoke-RestMethod -Uri $url
```

Should return JSON with toppings array.

### Test 2: Check Your Google Sheet

1. Open your Google Sheet
2. Verify you have a **Toppings** tab
3. Verify the structure:

| id | name | description | price_inr | icon_emoji | is_available | sort_order |
|----|------|-------------|-----------|------------|--------------|------------|
| top001 | Chocolate Chips | Rich chocolate | 50 | 🍫 | TRUE | 1 |
| top002 | Sprinkles | Colorful | 30 | 🌈 | TRUE | 2 |

4. Verify your **Products** tab has `allowed_toppings` column (Column I):

| ... | allowed_toppings |
|-----|------------------|
| ... | top001 top002    |

### Test 3: Restart Dev Server

```bash
# Stop all Node processes
Get-Process node | Stop-Process -Force

# Start fresh
npm run dev
```

### Test 4: Clear Browser Data

1. Open Developer Tools (F12)
2. Console tab, run:
   ```javascript
   localStorage.clear()
   ```
3. Hard refresh: `Ctrl + Shift + R`

---

## 🚀 After Successful Deployment

Once you see JSON responses (not HTML), your toppings should work!

1. Visit your website: `http://localhost:3000`
2. Click "Add to Cart" on any product
3. The toppings modal should now show available toppings

If it still doesn't work after proper deployment, we'll check:
- Google Sheet structure
- Product-topping linkage
- Frontend console errors

---

## 💡 Pro Tips

1. **Always create NEW deployments** when you update code (don't edit existing ones)
2. **Keep a test API key** separate from production
3. **Check Executions log** in Apps Script for debugging:
   - Click **Executions** icon on left sidebar
   - See all API calls and errors

4. **Enable logging** temporarily:
   ```javascript
   // Add to handleGetToppings() for debugging
   Logger.log('Toppings data: ' + JSON.stringify(toppings));
   ```

---

## 📞 Still Not Working?

If after following all steps you still get issues, check:

1. **Apps Script Execution Log:**
   - Apps Script Editor → Executions
   - Look for errors in recent runs

2. **Browser Console:**
   - F12 → Console tab
   - Look for network errors or API failures

3. **Network Tab:**
   - F12 → Network tab
   - Filter: XHR
   - Click on the `apps-script?route=toppings` request
   - Check Response tab

Share the error messages and we'll troubleshoot further!

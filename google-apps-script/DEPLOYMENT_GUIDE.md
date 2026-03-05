# Google Apps Script Deployment Guide

## Prerequisites

✅ Google Account  
✅ Google Sheet created (see `../google-sheets-setup/QUICK_SETUP.md`)  
✅ Code.gs file ready (in this folder)

---

## Step 1: Open Apps Script Editor

1. Open your **Cake Takeaway System** Google Sheet
2. Click **Extensions** menu → **Apps Script**
3. A new tab will open with the Apps Script editor

---

## Step 2: Add Your Code

1. You'll see a default `Code.gs` file with some sample code
2. **Delete all the default code**
3. Copy the entire contents of `Code.gs` from this folder
4. Paste it into the Apps Script editor
5. Click the **Save** icon (or Ctrl+S)
6. Name your project: `Cake Takeaway Backend`

---

## Step 3: Create appsscript.json

1. In the left sidebar, click the **+** next to "Files"
2. Select **Script** → No, create a file called `appsscript.json` instead
3. But actually, let's do it differently:
   - Click the **⚙️ Project Settings** (gear icon in left sidebar)
   - Scroll down and check **"Show "appsscript.json" manifest file in editor"**
   - Go back to **Editor** (< icon)
   - You'll now see `appsscript.json` in the files list
4. Click on `appsscript.json`
5. Replace its contents with:

```json
{
  "timeZone": "Asia/Kolkata",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/script.external_request"
  ]
}
```

6. Click **Save**

---

## Step 4: Deploy as Web App

1. Click **Deploy** button (top right) → **New deployment**
2. Click the **⚙️ gear icon** next to "Select type"
3. Select **Web app**
4. Fill in the details:
   - **Description**: `Cake Takeaway API v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
5. Click **Deploy**
6. **Authorize the app**:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to Cake Takeaway Backend (unsafe)**
   - Click **Allow**
7. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
8. Click **Done**

---

## Step 5: Configure Script Properties

These are like environment variables for your Apps Script.

1. Click **⚙️ Project Settings** (left sidebar)
2. Scroll to **Script Properties** section
3. Click **Add script property**
4. Add these properties one by one:

| Property Name | Value | Description |
|--------------|-------|-------------|
| `SHEET_ID` | Your Sheet ID from URL | The spreadsheet ID |
| `APPS_SCRIPT_API_KEY` | `your-secret-key-123` | Any random secret string |
| `CRM_MODE` | `WEBHOOK` | Leave as WEBHOOK |
| `CRM_WEBHOOK_ORDER_URL` | (leave empty for now) | Your CRM webhook URL |
| `CRM_WEBHOOK_BOOKING_URL` | (leave empty for now) | Your CRM webhook URL |
| `CRM_API_KEY` | (leave empty for now) | Your CRM API key |
| `CRM_AUTH_MODE` | `BEARER` | BEARER or X-API-KEY |
| `CRM_TIMEOUT_MS` | `30000` | 30 seconds |
| `CALENDAR_ID` | (leave empty for now) | Your Google Calendar ID |
| `LOOKBACK_MINUTES` | `180` | 3 hours |
| `LOOKAHEAD_DAYS` | `60` | 60 days |

**To get your Sheet ID:**
- Look at your Google Sheet URL
- Copy the part between `/d/` and `/edit`:
  ```
  https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
  ```

**For APPS_SCRIPT_API_KEY:**
- Generate a random string, like: `cake_secret_2026_xyz789`
- Keep it secure! This prevents unauthorized access to your API

5. Click **Save script properties**

---

## Step 6: Install Triggers (Optional - for Calendar Sync)

If you want automatic calendar booking sync:

1. Click the **⏰ Triggers** icon (left sidebar, looks like a clock)
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - **Choose which function to run**: `syncCalendarBookings`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `Time-driven`
   - **Select type of time based trigger**: `Minutes timer`
   - **Select minute interval**: `Every 5 minutes`
4. Click **Save**
5. **Authorize** if prompted
6. Repeat for retry functions:
   - Add trigger for `retryFailedOrderPushes` - run every hour
   - Add trigger for `retryFailedBookingPushes` - run every hour

**Alternative:** Run the `installTriggers()` function once:
1. Select `installTriggers` from the function dropdown (top)
2. Click **Run**
3. Authorize if prompted

---

## Step 7: Test Your Deployment

### Test 1: Get Products

1. Copy your Web App URL
2. Add the query parameter: `?route=products&x-api-key=your-secret-key-123`
3. Open in browser:
   ```
   https://script.google.com/macros/s/YOUR_ID/exec?route=products&x-api-key=your-secret-key-123
   ```
4. You should see JSON response with all your products! 🎉

### Test 2: Get Time Slots

```
https://script.google.com/macros/s/YOUR_ID/exec?route=timeslots&date=2026-03-06&x-api-key=your-secret-key-123
```

---

## Step 8: Update Your Next.js App

1. In your Next.js project, create `.env.local` file:

```env
# Google Apps Script
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_APPS_SCRIPT_API_KEY=your-secret-key-123

# Razorpay (get from https://dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX

# Optional: For production
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

2. Replace:
   - `YOUR_DEPLOYMENT_ID` with your actual deployment ID
   - `your-secret-key-123` with your actual API key
   - Razorpay keys with your actual keys from [Razorpay Dashboard](https://dashboard.razorpay.com)

3. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

---

## Common Issues & Solutions

### Issue: "Script function not found"
**Solution:** Make sure you saved Code.gs and deployed the latest version.

### Issue: "Authorization required"
**Solution:** 
1. Go to Apps Script editor
2. Select any function (e.g., `doGet`)
3. Click Run
4. Complete authorization flow

### Issue: "Cannot read properties of null"
**Solution:** Check that all required Script Properties are set correctly.

### Issue: "Products not loading in website"
**Solution:** 
1. Check browser console for errors
2. Verify Web App URL in `.env.local`
3. Verify API key matches in both places
4. Make sure Sheet permissions are set to "Anyone with link can edit"

### Issue: "Time slots showing 0 available"
**Solution:** 
1. Verify TimeSlots sheet has data
2. Check that dates are formatted as `YYYY-MM-DD`
3. Verify `is_open` is set to TRUE
4. Make sure `max_orders` is greater than 0

---

## Updating Your Deployment

When you make changes to Code.gs:

1. Save your changes
2. Click **Deploy** → **Manage deployments**
3. Click **✏️ Edit** next to your active deployment
4. Under **Version**, select **New version**
5. Update description (optional)
6. Click **Deploy**

The Web App URL stays the same, but now uses the updated code!

---

## Security Best Practices

✅ Use strong, random API keys  
✅ Don't commit `.env.local` to git (it's in .gitignore)  
✅ For production, restrict Sheet access to specific people  
✅ Enable Razorpay webhook signature verification  
✅ Monitor your Apps Script execution logs  

---

## Next Steps

✅ Setup complete!  
✅ Test your website  
✅ Add real cake photos  
✅ Configure Razorpay payment gateway  
✅ Setup Google Calendar for bookings  
✅ Configure CRM webhooks (optional)  

🎂 Your Cake Takeaway website is now live! 🎉

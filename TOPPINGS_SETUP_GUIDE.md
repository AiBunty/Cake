# Fix Toppings Tab - Step-by-Step Guide

## ✅ Quick Fix for Toppings Not Loading

Your toppings aren't showing because the **Toppings sheet has the wrong structure** or missing data. Here's how to fix it:

---

## **Step 1: Open the Helper Script**

A new file has been created: `google-apps-script/SetupToppingsTab.gs`

This script will automatically:
- Create a new Toppings sheet with correct columns
- Add 10 sample toppings with proper formatting
- Or add more toppings to existing sheet

---

## **Step 2: Go to Google Apps Script Editor**

1. **Open your Apps Script project:**
   - Go to: https://script.google.com
   - Open the **Cake Takeaway** project (same one with Code.gs)

2. **Create new file:**
   - Click **+ New file** button
   - Select **Apps Script**
   - Name it: `SetupToppingsTab`

3. **Copy the helper code:**
   - Go to: `d:\GITHUB Projects\Cake\Cake\google-apps-script\SetupToppingsTab.gs`
   - Copy ALL the code
   - Paste into the new file in Apps Script editor

4. **Save:**
   - Press `Ctrl+S` or click **Save**

---

## **Step 3: Run the Setup Function**

1. **Select the function:**
   - In the editor, go to the line: `function setupToppingsTab() {`
   - Click anywhere in that function

2. **Run it:**
   - Click **▶ Run** button (top toolbar)
   - Or press `Ctrl+Shift+Enter`

3. **Check the logs:**
   - Click **View** → **Logs**
   - You should see:
     ```
     ✅ Deleted old Toppings sheet
     ✅ Created new Toppings sheet
     ✅ Created headers
     ✅ Added 10 sample toppings
     ✅ Toppings tab setup complete!
     ```

---

## **Step 4: Verify in Google Sheets**

1. Go to your **Google Sheet** (the one linked in Code.gs)
2. Look for the **Toppings** tab (new sheet tab should appear)
3. You should see:
   - **Row 1 (Headers):** ID, Name, Description, Price (INR), Icon/Emoji, Is Available, Sort Order
   - **Rows 2-11:** 10 sample toppings with chocolate chips, sprinkles, whipped cream, etc.

---

## **Step 5: Deploy the Code**

1. **Deploy Code.gs:**
   - Go back to Apps Script
   - Open `Code.gs`
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Your Account**
   - Who has access: **Anyone** ⚠️ (IMPORTANT!)
   - Click **Deploy**
   - Copy the NEW deployment URL

2. **Update Configuration:**
   - Update `.env.local`:
     ```
     NEXT_PUBLIC_APPS_SCRIPT_BASE_URL=<NEW_URL_HERE>
     ```
   - Restart dev server

---

## **Toppings Sheet - Correct Structure**

| Column | Name | Type | Example |
|--------|------|------|---------|
| A | ID | Text | T001 |
| B | Name | Text | Chocolate Chips |
| C | Description | Text | Extra dark chocolate chips |
| D | Price (INR) | Number | 50 |
| E | Icon/Emoji | Text | 🍫 |
| F | Is Available | TRUE/FALSE | TRUE |
| G | Sort Order | Number | 1 |

---

## **If You Don't Want to Use Helper Script**

Manually create the Toppings sheet with same structure:

1. Create tab: **Toppings**
2. Add headers in Row 1
3. Add at least 3 rows of topping data
4. Make sure column F has TRUE/FALSE values
5. Make sure column D has numeric prices

---

## **Functions in SetupToppingsTab.gs**

1. **`setupToppingsTab()`** - Creates a fresh Toppings sheet with 10 sample toppings
2. **`addMoreToppings()`** - Adds 3 more toppings to existing sheet
3. **`viewCurrentToppings()`** - Shows current toppings in logs

---

## **Troubleshooting**

**Error: "Sheet not found"?**
- The SHEET_ID in Code.gs doesn't match your sheet
- Update `SHEET_ID` in Code.gs properties

**Toppings still not showing?**
- Check if Toppings sheet exists in Google Sheets
- Run `viewCurrentToppings()` to see the data
- Restart the dev server after deployment

**Still getting HTTP 500?**
- Make sure you redeployed Code.gs after creating Toppings sheet
- Check 'Anyone' access is set on the Web app deployment

---

## **Next Steps**

1. ✅ Run the helper script
2. ✅ Verify Toppings tab in Google Sheets
3. ✅ Deploy Code.gs
4. ✅ Update deployment URL
5. ✅ Test toppings endpoint: http://localhost:3000/sheet-diagnostics.html
6. ✅ Push to GitHub & redeploy Vercel

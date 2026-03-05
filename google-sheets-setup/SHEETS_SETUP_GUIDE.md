# Google Sheets Setup Guide

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **Cake Takeaway System**
4. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Step 2: Create Required Tabs

Your spreadsheet needs these 5 tabs (sheets):

1. **Products** - Product catalog
2. **TimeSlots** - Available pickup time slots
3. **Orders** - Customer orders
4. **CalendarBookings** - Calendar consultation bookings
5. **Settings** - System configuration

---

## Tab 1: Products

### Column Headers (Row 1):
```
id | name | description | price_inr | image_url | category | is_available | sort_order
```

### Sample Data:
Copy the data from `sample-products.csv` into this sheet starting from row 2.

**Column Details:**
- **id**: Unique identifier (e.g., CAKE001, CAKE002)
- **name**: Product name
- **description**: Short description
- **price_inr**: Price in Indian Rupees (numeric)
- **image_url**: Direct link to product image
- **category**: One of: Birthday, Wedding, Anniversary, Custom, Cupcakes, Pastries
- **is_available**: TRUE or FALSE
- **sort_order**: Number for sorting (lower appears first)

---

## Tab 2: TimeSlots

### Column Headers (Row 1):
```
date | slot_label | start_time | end_time | max_orders | is_open
```

### Sample Data:
```
2026-03-06 | Morning Slot | 10:00 | 12:00 | 5 | TRUE
2026-03-06 | Afternoon Slot | 14:00 | 16:00 | 5 | TRUE
2026-03-06 | Evening Slot | 18:00 | 20:00 | 5 | TRUE
2026-03-07 | Morning Slot | 10:00 | 12:00 | 5 | TRUE
2026-03-07 | Afternoon Slot | 14:00 | 16:00 | 5 | TRUE
2026-03-07 | Evening Slot | 18:00 | 20:00 | 5 | TRUE
2026-03-08 | Morning Slot | 10:00 | 12:00 | 5 | TRUE
2026-03-08 | Afternoon Slot | 14:00 | 16:00 | 5 | TRUE
2026-03-08 | Evening Slot | 18:00 | 20:00 | 5 | TRUE
2026-03-09 | Morning Slot | 10:00 | 12:00 | 5 | TRUE
2026-03-09 | Afternoon Slot | 14:00 | 16:00 | 5 | TRUE
2026-03-09 | Evening Slot | 18:00 | 20:00 | 5 | TRUE
2026-03-10 | Morning Slot | 10:00 | 12:00 | 5 | TRUE
2026-03-10 | Afternoon Slot | 14:00 | 16:00 | 5 | TRUE
2026-03-10 | Evening Slot | 18:00 | 20:00 | 5 | TRUE
```

**Tips:**
- Add more dates as needed (next 30-60 days)
- Adjust `max_orders` based on your capacity
- Set `is_open` to FALSE to close specific slots

---

## Tab 3: Orders

### Column Headers (Row 1):
```
order_id | created_at | customer_name | phone | email | pickup_date | pickup_slot_label | pickup_start_time | pickup_end_time | pickup_timezone | cart_json | subtotal_inr | payment_status | razorpay_order_id | razorpay_payment_id | razorpay_signature | crm_push_status | crm_push_error | crm_contact_id | crm_opportunity_id | invoice_receipt_url | notes
```

**Leave this empty** - Orders will be automatically populated when customers place orders.

---

## Tab 4: CalendarBookings

### Column Headers (Row 1):
```
booking_id | created_at | event_id | event_status | customer_name | phone | email | required_date | required_start_time | required_end_time | timezone | notes | source | crm_push_status | crm_push_error | crm_contact_id | crm_opportunity_id
```

**Leave this empty** - Bookings will be automatically synced from Google Calendar.

---

## Tab 5: Settings

### Column Headers (Row 1):
```
key | value
```

### Sample Data:
```
contact_type | Customer
assigned_to_staff | Owner
business_name | Luxury Cakes
business_phone | +91-9876543210
business_email | info@luxurycakes.com
```

---

## Step 3: Set Sheet Permissions

1. Click **Share** button (top right)
2. Under "General access" select **Anyone with the link**
3. Change from "Viewer" to **Editor**
4. Click **Done**

⚠️ **Important**: The Apps Script needs Editor access to read/write data.

---

## Step 4: Get Images for Products

The sample data uses **Unsplash** images. These are free high-quality photos that work great for demos:

- All image URLs in the sample data are direct links
- They will load instantly in your website
- For production, upload your own cake photos to Google Drive or image hosting service

**To use your own images:**
1. Upload to Google Drive
2. Right-click image → Get link → Anyone with the link can view
3. Copy the file ID: `https://drive.google.com/file/d/{FILE_ID}/view`
4. Convert to direct link: `https://drive.google.com/uc?export=view&id={FILE_ID}`

---

## Next Steps

After setting up the Google Sheet:
1. Deploy the Google Apps Script (see `../google-apps-script/DEPLOYMENT_GUIDE.md`)
2. Configure environment variables in `.env.local`
3. Test the website with your sample data!

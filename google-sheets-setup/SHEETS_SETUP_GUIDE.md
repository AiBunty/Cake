# Google Sheets Setup Guide

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **Cake Takeaway System**
4. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Step 2: Create Required Tabs

Your spreadsheet needs these 6 tabs (sheets):

1. **Products** - Product catalog
2. **Toppings** - Available toppings/add-ons
3. **TimeSlots** - Available pickup time slots
4. **Orders** - Customer orders
5. **CalendarBookings** - Calendar consultation bookings
6. **Settings** - System configuration

---

## Tab 1: Products

### Column Headers (Row 1):
```
id | name | description | price_inr | image_url | category | is_available | sort_order | allowed_toppings
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
- **allowed_toppings**: Space or comma-separated topping IDs (e.g., "top001 top005 top008") - Optional field to link toppings to specific products

**Example with allowed_toppings:**
```
CAKE001 | Chocolate Delight | Rich chocolate cake | 1200 | https://... | Birthday | TRUE | 1 | top001 top005 top008
CAKE002 | Vanilla Dream | Classic vanilla | 950 | https://... | Birthday | TRUE | 2 | top001 top002 top003
CAKE003 | Red Velvet | Cream cheese frosting | 1350 | https://... | Wedding | TRUE | 3 | 
```

**Notes:**
- Leave `allowed_toppings` empty to add product without topping selection
- Use topping IDs from your Toppings tab (e.g., top001, top002)
- Separate multiple IDs with spaces or commas: "top001 top005" or "top001,top005,top008"

---

## Tab 2: Toppings

### Column Headers (Row 1):
```
id | name | description | price_inr | icon_emoji | is_available | sort_order
```

### Sample Data:
```
top001 | Extra Chocolate Chips | Premium dark chocolate chips | 80 | 🍫 | TRUE | 1
top002 | Fresh Strawberries | Hand-picked strawberries | 120 | 🍓 | TRUE | 2
top003 | Caramel Drizzle | Homemade caramel sauce | 60 | 🍯 | TRUE | 3
top004 | Edible Gold Flakes | 24K edible gold | 250 | ✨ | TRUE | 4
top005 | Whipped Cream | Fresh whipped cream | 50 | 🥛 | TRUE | 5
top006 | Chocolate Ganache | Rich chocolate coating | 100 | 🍫 | TRUE | 6
top007 | Crushed Nuts | Mixed nuts topping | 70 | 🥜 | TRUE | 7
top008 | Fresh Berries Mix | Blueberries & raspberries | 150 | 🫐 | TRUE | 8
```

**Column Details:**
- **id**: Unique identifier (e.g., top001, top002)
- **name**: Topping name
- **description**: Short description
- **price_inr**: Additional price in Indian Rupees (numeric)
- **icon_emoji**: Emoji to display with topping
- **is_available**: TRUE or FALSE
- **sort_order**: Number for sorting (lower appears first)

**Notes:**
- These topping IDs (top001, top002, etc.) are used in Products tab `allowed_toppings` column
- When a product has allowed_toppings specified, customers will see a modal to select these toppings
- Topping prices are per topping, multiplied by product quantity

---4

## Tab 3: TimeSlots

### Column Headers (Row 1):
```
date | slot_label | start_time | end_time | max_orders | is_open
```

### Sample Data:
```
2026-03506 | Morning Slot | 10:00 | 12:00 | 5 | TRUE
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

## Tab 6: Settings

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

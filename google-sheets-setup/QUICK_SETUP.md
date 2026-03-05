# 🚀 Quick Setup - 5 Minutes to Demo!

## Step-by-Step Instructions

### 1️⃣ Create Google Sheet (1 minute)

1. Open [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create new spreadsheet
3. Name it: `Cake Takeaway System`
4. Copy the URL (you'll need the Sheet ID later)

---

### 2️⃣ Create 5 Tabs (1 minute)

At the bottom, you'll see "Sheet1". 

**Rename it to:** `Products`

Then create 4 more sheets by clicking the **+** button:
- `TimeSlots`
- `Orders`
- `CalendarBookings`
- `Settings`

---

### 3️⃣ Setup Products Tab (2 minutes)

1. Click on the **Products** tab
2. In cell **A1**, paste this header row:

```
id	name	description	price_inr	image_url	category	is_available	sort_order
```

3. Download the `sample-products.csv` file from this folder
4. Open it in Excel/Notepad
5. Copy all rows (except header)
6. Paste in cell **A2** of your Google Sheet

**OR** Copy this data manually:

| id | name | description | price_inr | image_url | category | is_available | sort_order |
|----|------|-------------|-----------|-----------|----------|--------------|------------|
| CAKE001 | Chocolate Fudge Delight | Rich dark chocolate cake with smooth fudge frosting | 1200 | https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800 | Birthday | TRUE | 1 |
| CAKE002 | Red Velvet Classic | Smooth red velvet cake with cream cheese frosting | 1400 | https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800 | Birthday | TRUE | 2 |
| CAKE003 | Strawberry Dream | Fresh strawberry cake with whipped cream and berries | 1600 | https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800 | Birthday | TRUE | 3 |
| CAKE004 | Black Forest Heaven | Classic black forest with cherries and chocolate layers | 1500 | https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800 | Birthday | TRUE | 4 |
| CAKE005 | Vanilla Bean Elegance | Premium vanilla bean cake with Swiss buttercream | 1300 | https://images.unsplash.com/photo-1588195538326-c5b1e5b80634?w=800 | Birthday | TRUE | 5 |
| CAKE006 | Triple Tier Wedding Bliss | Elegant three-tier wedding cake with floral decor | 12000 | https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800 | Wedding | TRUE | 6 |
| CAKE007 | Rose Garden Wedding | Romantic rose-themed wedding cake with buttercream | 15000 | https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800 | Wedding | TRUE | 7 |
| CAKE008 | Naked Cake Rustic Charm | Minimalist naked cake with fresh flowers | 8000 | https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800 | Wedding | TRUE | 8 |
| CAKE009 | Golden Anniversary Special | Luxurious gold-themed anniversary cake | 2500 | https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800 | Anniversary | TRUE | 9 |
| CAKE010 | Heart Shape Romance | Beautiful heart-shaped cake with red roses | 1800 | https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800 | Anniversary | TRUE | 10 |
| CAKE011 | Tiramisu Temptation | Italian espresso-soaked layers with mascarpone | 1700 | https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800 | Custom | TRUE | 11 |
| CAKE012 | Mango Madness | Tropical mango mousse with fresh mango | 1600 | https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800 | Custom | TRUE | 12 |
| CAKE013 | Matcha Green Tea | Premium matcha with white chocolate ganache | 1900 | https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800 | Custom | TRUE | 13 |
| CAKE014 | Unicorn Rainbow Delight | Colorful rainbow unicorn-themed cake | 2200 | https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800 | Birthday | TRUE | 14 |
| CAKE015 | Chocolate Cupcake Box | 12 gourmet chocolate cupcakes | 800 | https://images.unsplash.com/photo-1587241321921-91a834d82f76?w=800 | Cupcakes | TRUE | 15 |
| CAKE016 | Vanilla Cupcake Assortment | 12 vanilla cupcakes with buttercream | 750 | https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800 | Cupcakes | TRUE | 16 |
| CAKE017 | Red Velvet Cupcakes | 6 red velvet cupcakes with cream cheese | 450 | https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800 | Cupcakes | TRUE | 17 |
| CAKE018 | Blueberry Cheesecake Pastry | Individual blueberry cheesecake | 300 | https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800 | Pastries | TRUE | 18 |
| CAKE019 | Chocolate Eclairs | Classic French eclairs with ganache | 250 | https://images.unsplash.com/photo-1612786410972-cc346289c2eb?w=800 | Pastries | TRUE | 19 |
| CAKE020 | Fruit Tart Collection | Assorted mini fruit tarts with custard | 600 | https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800 | Pastries | TRUE | 20 |

---

### 4️⃣ Setup TimeSlots Tab (30 seconds)

1. Click on **TimeSlots** tab
2. In cell **A1**, paste:

```
date	slot_label	start_time	end_time	max_orders	is_open
```

3. In cell **A2**, paste these rows (add more dates as needed):

```
2026-03-06	Morning Slot	10:00	12:00	5	TRUE
2026-03-06	Afternoon Slot	14:00	16:00	5	TRUE
2026-03-06	Evening Slot	18:00	20:00	5	TRUE
2026-03-07	Morning Slot	10:00	12:00	5	TRUE
2026-03-07	Afternoon Slot	14:00	16:00	5	TRUE
2026-03-07	Evening Slot	18:00	20:00	5	TRUE
2026-03-08	Morning Slot	10:00	12:00	5	TRUE
2026-03-08	Afternoon Slot	14:00	16:00	5	TRUE
```

---

### 5️⃣ Setup Orders Tab (10 seconds)

1. Click on **Orders** tab
2. In cell **A1**, paste this header:

```
order_id	created_at	customer_name	phone	email	pickup_date	pickup_slot_label	pickup_start_time	pickup_end_time	pickup_timezone	cart_json	subtotal_inr	payment_status	razorpay_order_id	razorpay_payment_id	razorpay_signature	crm_push_status	crm_push_error	crm_contact_id	crm_opportunity_id	invoice_receipt_url	notes
```

3. Leave rows below empty (orders will populate automatically)

---

### 6️⃣ Setup CalendarBookings Tab (10 seconds)

1. Click on **CalendarBookings** tab
2. In cell **A1**, paste:

```
booking_id	created_at	event_id	event_status	customer_name	phone	email	required_date	required_start_time	required_end_time	timezone	notes	source	crm_push_status	crm_push_error	crm_contact_id	crm_opportunity_id
```

3. Leave rows below empty (bookings will populate automatically)

---

### 7️⃣ Setup Settings Tab (10 seconds)

1. Click on **Settings** tab
2. In cell **A1**, paste:

```
key	value
```

3. In cell **A2**, paste:

```
contact_type	Customer
assigned_to_staff	Owner
business_name	Luxury Cakes
business_phone	+91-9876543210
business_email	info@luxurycakes.com
```

---

### 8️⃣ Set Permissions (10 seconds)

1. Click **Share** button (top right corner)
2. Under "General access" change from "Restricted" to **Anyone with the link**
3. Change permission from "Viewer" to **Editor**
4. Click **Done**

---

## ✅ You're Done!

Your Google Sheet is ready! 

### Next Steps:

1. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
   ```

2. **Deploy the Apps Script** (see `../google-apps-script/DEPLOYMENT_GUIDE.md`)

3. **Configure `.env.local`** with your Sheet ID and API keys

4. **Test your website!**

---

## 🎨 Customize Your Demo

**Add more products:**
- Just add new rows in the Products tab
- Use Unsplash URLs for images: `https://images.unsplash.com/photo-{ID}?w=800`

**Adjust time slots:**
- Add more dates (next 30-60 days)
- Change times to match your business hours
- Set `is_open` to FALSE to close specific slots

**Upload your own images:**
1. Upload to Google Drive
2. Get shareable link (Anyone can view)
3. Convert to direct link format
4. Replace URLs in image_url column

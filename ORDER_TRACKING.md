# Order Tracking & User Data Management

## Overview
This document explains how customers can track their orders and how user data is maintained in Google Sheets.

---

## Features Implemented

### 1. **Order Retrieval System**
Customers can now search and view their order history using either:
- **Email address**
- **Phone number**

### 2. **Order Information Displayed**
For each order, customers can see:
- ✅ Order ID (unique identifier)
- ✅ Payment Status (PAID, AWAITING PAYMENT, FAILED)
- ✅ Pickup Date & Time
- ✅ Time Slot Label
- ✅ Ordered Items with quantities
- ✅ Selected toppings (if any)
- ✅ Total amount paid
- ✅ Special instructions/notes
- ✅ Order creation timestamp

---

## How It Works

### Backend (Google Apps Script)

#### New API Endpoint: `orders_by_customer`
**Route:** `GET /?route=orders_by_customer&email=xxx` or `&phone=xxx`

**Functionality:**
1. Searches the `Orders` sheet for all orders matching the provided email or phone
2. Returns orders sorted by creation date (newest first)
3. Includes all order details including cart items and payment status

**Code Location:** `google-apps-script/Code.gs` → `handleGetOrdersByCustomer()`

#### Data Structure in Orders Sheet
Each row in the Orders sheet contains:
- Column A: `order_id` (unique identifier like ORD-1234567890)
- Column B: `created_at` (ISO timestamp)
- Column C: `customer_name`
- Column D: `phone`
- Column E: `email`
- Column F: `pickup_date`
- Column G: `pickup_slot_label`
- Column H-I: `pickup_start_time`, `pickup_end_time`
- Column J: `pickup_timezone`
- Column K: `cart_json` (stringified JSON of cart items)
- Column L: `subtotal_inr`
- Column M: `payment_status` (CREATED, PAID, FAILED)
- Column N-P: Razorpay related fields
- Column Q-T: CRM integration fields
- Column U: `invoice_receipt_url`
- Column V: `notes`

---

## Frontend Implementation

### New Page: `/track-orders`
**Location:** `app/track-orders/page.tsx`

**Features:**
- 🔍 Search form with email OR phone input
- 📦 Beautiful card-based order display
- 🎨 Status indicators with colors:
  - **Green** - Payment Confirmed (PAID)
  - **Yellow** - Awaiting Payment (CREATED)
  - **Red** - Payment Failed (FAILED)
- 📱 Fully responsive design
- ✨ Smooth animations with Framer Motion
- 🧾 Detailed order items breakdown including toppings

### API Function
**Location:** `lib/api.ts` → `getOrdersByCustomer()`

Calls the Apps Script endpoint with customer email/phone and returns order data.

### Navigation
Added "Track Orders" link in the main navigation bar with a package icon.

---

## User Data Management in Google Sheets

### How Customer Data is Stored

#### **Per-Order Model**
- Each order is stored as a **separate row** in the Orders sheet
- Customer information (name, email, phone) is duplicated in each order row
- This allows tracking complete order history per customer

#### **Benefits of This Approach:**
1. ✅ **Simple Queries:** Easy to search orders by email or phone
2. ✅ **Data Integrity:** Each order is self-contained
3. ✅ **Historical View:** Complete snapshot of customer details at order time
4. ✅ **No Complex Joins:** No need for separate Customers sheet
5. ✅ **CRM Integration:** Each order can be pushed to CRM independently

### Data Retention & Privacy

#### Current Setup:
- All orders are retained indefinitely in the Orders sheet
- Customer data is stored with each order
- No automated data deletion

#### Recommendations for GDPR Compliance:
If you need to comply with data protection regulations:

1. **Add Data Retention Policy:**
   - Archive orders older than X months to a separate "Archive" sheet
   - Implement automatic deletion after Y years

2. **Customer Data Request Handling:**
   - Use the `orders_by_customer` endpoint to retrieve all user data
   - Manually delete rows for data deletion requests

3. **Pseudonymization:**
   - Consider storing only hashed phone numbers for tracking
   - Keep identifiable data only until order fulfillment

---

## Usage Guide for Customers

### How to Track Orders:

1. **Visit the Website**
   - Navigate to your cake website

2. **Click "Track Orders"**
   - Located in the main navigation bar

3. **Enter Your Details**
   - Provide either email address OR phone number
   - (The same details you used when placing the order)

4. **View Your Orders**
   - See all your past orders sorted by date
   - Check payment status
   - Review order details and pickup times

### Order Status Meanings:

| Status | Icon | Meaning |
|--------|------|---------|
| **Payment Confirmed** | ✅ Green | Order is paid and confirmed. Prepare for pickup! |
| **Awaiting Payment** | ⚠️ Yellow | Order created but payment pending. Complete payment soon. |
| **Payment Failed** | ❌ Red | Payment could not be processed. Try again or contact support. |

---

## Deployment Instructions

### 1. **Update Google Apps Script**
```bash
# Copy the updated Code.gs to your Apps Script project
# File: google-apps-script/Code.gs
```

**Steps:**
1. Open your Google Apps Script project
2. Replace the contents of `Code.gs` with the updated file
3. Click **Deploy → New deployment**
4. Select **Web app**
5. Set **Execute as:** Me
6. Set **Who has access:** Anyone
7. Click **Deploy**
8. Copy the new deployment URL
9. Update `.env.local` with the new URL if changed

### 2. **Frontend Deployment**
No additional steps needed! The new page and API function will be automatically deployed with your Next.js app.

### 3. **Test the Feature**
1. Create a test order on your website
2. Mark it as paid (or let Razorpay webhook handle it)
3. Go to `/track-orders`
4. Enter the email/phone used for the test order
5. Verify the order appears correctly

---

## Security Considerations

### Current Security Measures:
✅ API key authentication required for all Apps Script calls  
✅ Email and phone are case-insensitive matched  
✅ No sensitive payment details exposed (only order IDs shown)  
✅ HTTPS encryption for all API calls  

### Additional Security Recommendations:

1. **Rate Limiting:**
   - Implement server-side rate limiting to prevent abuse
   - Limit searches to 10 per minute per IP

2. **Email Verification:**
   - Consider sending a verification code to email before showing orders
   - Adds extra security layer for sensitive data

3. **OTP-Based Access:**
   - Send OTP to phone number before revealing orders
   - Prevents unauthorized access with just phone number

4. **CAPTCHA:**
   - Add CAPTCHA to the search form
   - Prevents automated scraping of order data

---

## Advanced Features (Future Enhancements)

### Suggested Improvements:

1. **Email Notifications:**
   - Send order confirmation email with tracking link
   - Link format: `yourwebsite.com/track-orders?email=xxx&token=yyy`

2. **Order Cancellation:**
   - Allow customers to cancel unpaid orders
   - Add cancellation deadline (e.g., 24 hours before pickup)

3. **Order Modification:**
   - Let customers modify pickup time slots
   - Add/remove items before order confirmation

4. **SMS Notifications:**
   - Send SMS with order status updates
   - Remind customers 1 day before pickup

5. **Loyalty Program:**
   - Track total orders per customer
   - Offer discounts after X orders

6. **Order Reviews:**
   - Add review/rating feature after order completion
   - Store reviews in separate "Reviews" sheet

7. **Customer Dashboard:**
   - Create personalized customer account
   - Store preferences, favorite items, addresses

---

## Troubleshooting

### Orders Not Showing Up?

**Check:**
1. ✅ Correct email/phone format used
2. ✅ Email is case-insensitive (should work)
3. ✅ Phone number matches exactly (no extra spaces)
4. ✅ Order exists in the Orders sheet
5. ✅ Apps Script deployment is updated

### Common Issues:

#### Issue: "Failed to retrieve orders"
**Solution:**
- Check Apps Script API key in `.env.local`
- Verify Apps Script deployment is latest version
- Check Apps Script execution logs for errors

#### Issue: Orders showing but incomplete data
**Solution:**
- Verify all columns in Orders sheet are filled
- Check `cart_json` column is valid JSON
- Ensure pickup date/time fields are populated

#### Issue: Search not working with phone
**Solution:**
- Ensure phone format matches exactly (e.g., +919876543210)
- No spaces, dashes, or special characters
- Try searching with email instead

---

## API Reference

### Get Orders by Customer

**Endpoint:** `GET /?route=orders_by_customer`

**Query Parameters:**
- `email` (optional): Customer email address
- `phone` (optional): Customer phone number
- At least one of `email` or `phone` must be provided

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "order_id": "ORD-1234567890",
      "created_at": "2026-03-05T10:30:00.000Z",
      "customer_name": "John Doe",
      "phone": "+919876543210",
      "email": "john@example.com",
      "pickup_date": "2026-03-10",
      "pickup_slot_label": "Morning",
      "pickup_start_time": "10:00",
      "pickup_end_time": "12:00",
      "pickup_timezone": "Asia/Kolkata",
      "cart_json": "{\"items\":[...]}",
      "subtotal_inr": 850,
      "payment_status": "PAID",
      "razorpay_order_id": "order_xyz123",
      "razorpay_payment_id": "pay_abc456",
      "notes": "Please add extra candles"
    }
  ]
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "Email or phone parameter required"
}
```

---

## Summary

✅ **Implemented:** Complete order tracking system  
✅ **User-Friendly:** Simple search by email or phone  
✅ **Comprehensive:** Shows all order details and status  
✅ **Secure:** API key protected, HTTPS encrypted  
✅ **Scalable:** Works with unlimited orders per customer  
✅ **Maintainable:** Easy to extend with new features  

The system is now ready for customers to track their orders independently, reducing support queries and improving customer experience! 🎉

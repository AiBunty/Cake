# Google Sheets Settings Tab Structure

The **Settings** tab contains company configuration data that's fetched dynamically at runtime. This eliminates the need to hardcode company details.

## Column Structure

Create a Google Sheet with the following columns:

| Column A | Column B |
|----------|----------|
| **Key** | **Value** |

## Recommended Settings Rows

Add these rows to your **Settings** sheet (configure values as per your business):

| Key | Value | Description |
|-----|-------|-------------|
| `company_name` | Cakeouflage | Your bakery/cake shop name |
| `company_email` | contact@cakeouflage.com | Business email address |
| `company_phone` | 9870471017 | Primary contact number |
| `company_phone_2` | 9673565935 | Secondary contact number |
| `instagram_url` | https://instagram.com/cakeouflage | Instagram business profile link |
| `facebook_url` | https://facebook.com/cakeouflage | Facebook page link |
| `twitter_url` | https://twitter.com/cakeouflage | Twitter profile link (optional) |
| `whatsapp_number` | 919870471017 | WhatsApp business number (with country code) |
| `timezone` | Asia/Kolkata | Your timezone for order processing |
| `currency` | INR | Currency symbol/code |
| `min_order_value` | 300 | Minimum order value in rupees |
| `delivery_days` | 1-7 | Delivery window (e.g., "1-7 days advance order") |
| `tagline` | We take orders for all customised desserts and cakes from (1/2 kg)!! | Your business tagline |
| `address` | Your Shop Address | Physical store location (optional) |

## Setup Instructions

1. **Open your Google Sheet** where you have Products, TimeSlots, Orders, etc.

2. **Create a new sheet tab** named exactly: `Settings`

3. **Add column headers**:
   - Cell A1: `key`
   - Cell B1: `value`

4. **Add your company details** starting from row 2:
   ```
   A2: company_name          B2: Cakeouflage
   A3: company_email         B3: contact@cakeouflage.com
   A4: company_phone         B4: 9870471017
   A5: company_phone_2       B5: 9673565935
   A6: instagram_url         B6: https://instagram.com/cakeouflage
   A7: facebook_url          B7: https://facebook.com/cakeouflage
   A8: whatsapp_number       B8: 919870471017
   A9: timezone              B9: Asia/Kolkata
   A10: currency             B10: INR
   A11: min_order_value      B11: 300
   A12: delivery_days        B12: 1-7 days advance order
   A13: tagline              B13: We take orders for all customised desserts and cakes from (1/2 kg)!!
   ```

5. **Deploy and test** using the API endpoint:
   ```
   GET /api/apps-script?route=settings
   ```

## API Response Example

When you call the settings endpoint, you'll receive:

```json
{
  "ok": true,
  "data": {
    "company_name": "Cakeouflage",
    "company_email": "contact@cakeouflage.com",
    "company_phone": "9870471017",
    "company_phone_2": "9673565935",
    "instagram_url": "https://instagram.com/cakeouflage",
    "facebook_url": "https://facebook.com/cakeouflage",
    "whatsapp_number": "919870471017",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "min_order_value": "300",
    "delivery_days": "1-7 days advance order",
    "tagline": "We take orders for all customised desserts and cakes from (1/2 kg)!!"
  }
}
```

## Usage in Frontend

To fetch and use settings in your Next.js app:

```typescript
import { getSettings } from '@/lib/api';

// In a component or page
const { ok, data: settings } = await getSettings();

if (ok && settings) {
  console.log('Company Name:', settings.company_name);
  console.log('Phone:', settings.company_phone);
  console.log('Instagram:', settings.instagram_url);
}
```

## Additional Notes

- Keys are **case-sensitive** (use lowercase with underscores)
- Values can contain any text, URLs, phone numbers, etc.
- Add more keys as needed for your business
- Changes to Settings sheet are reflected immediately on next API call
- No deployment needed - Apps Script will read the latest values

## Next Steps

1. Add this Settings tab to your Google Sheet
2. Fill in your company details
3. Test the API endpoint in browser: `http://localhost:3000/api/apps-script?route=settings`
4. The footer and navbar components will use these settings to display company info and social media links

# Toppings Selection Feature

## Overview

This feature allows customers to select toppings/add-ons when adding cakes to their cart. Each product can be linked to specific toppings via the Google Sheets Products tab.

## How It Works

### 1. Google Sheets Setup

#### Products Tab
Add a new column `allowed_toppings` (Column I, after `sort_order`):

**Column Headers:**
```
id | name | description | price_inr | image_url | category | is_available | sort_order | allowed_toppings
```

**Example Data:**
```
CAKE001 | Chocolate Delight | Rich chocolate cake | 1200 | https://... | Birthday | TRUE | 1 | top001 top005 top008
CAKE002 | Vanilla Dream | Classic vanilla | 950 | https://... | Birthday | TRUE | 2 | top001 top002 top003
CAKE003 | Red Velvet | Cream cheese frosting | 1350 | https://... | Wedding | TRUE | 3 | 
```

**Rules:**
- Use space or comma-separated topping IDs: `"top001 top005"` or `"top001,top005,top008"`
- IDs must match the `id` column in Toppings tab
- Leave empty to add product without topping selection modal
- Case-insensitive matching (TOP001 = top001)

#### Toppings Tab
Standard structure (no changes needed):

**Column Headers:**
```
id | name | description | price_inr | icon_emoji | is_available | sort_order
```

**Example Data:**
```
top001 | Extra Chocolate Chips | Premium dark chocolate chips | 80 | 🍫 | TRUE | 1
top002 | Fresh Strawberries | Hand-picked strawberries | 120 | 🍓 | TRUE | 2
top003 | Caramel Drizzle | Homemade caramel sauce | 60 | 🍯 | TRUE | 3
top004 | Edible Gold Flakes | 24K edible gold | 250 | ✨ | TRUE | 4
top005 | Whipped Cream | Fresh whipped cream | 50 | 🥛 | TRUE | 5
```

### 2. Google Apps Script Changes

Updated `handleGetProducts()` in `Code.gs` to include `allowed_toppings` field:

```javascript
const product = {
  // ... other fields
  allowed_toppings: row[8] ? row[8].toString() : '', // Column I
};
```

### 3. Frontend Implementation

#### Type Definitions (`types/index.ts`)

**Product Interface:**
```typescript
export interface Product {
  // ... existing fields
  allowed_toppings?: string; // Space or comma-separated topping IDs
}
```

**New Interfaces:**
```typescript
export interface SelectedTopping {
  topping: Topping;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedToppings?: SelectedTopping[]; // New field
}
```

#### Components

**ToppingsModal.tsx** - New component that:
- Shows when "Add to Cart" is clicked (if product has allowed_toppings)
- Displays only allowed toppings filtered by product's allowed_toppings IDs
- Allows quantity selection for each topping
- Calculates total price including toppings
- Adds to cart with selected toppings

**ProductCard.tsx** - Updated to:
- Check if product has `allowed_toppings` configured
- Open modal if toppings exist, otherwise add directly to cart
- Pass all toppings to modal for filtering

**CartItemCard.tsx** - Updated to:
- Display selected toppings with emoji, name, and quantity
- Calculate total including topping prices
- Show topping prices per cake

#### Cart Logic (`lib/cart.ts`)

**Updated `addToCart()` function:**
- Accepts `selectedToppings` parameter
- Treats same product with different toppings as separate cart items
- Compares topping selections when checking for existing items

**Updated `calculateTotal()` function:**
- Includes topping prices in total calculation
- Formula: `(product_price * quantity) + (topping_price * topping_qty * product_qty)`

### 4. User Experience Flow

1. **Browse Products**: Customer sees all products on homepage
2. **Add to Cart Click**: 
   - If product has `allowed_toppings`: Opens ToppingsModal
   - If no `allowed_toppings`: Adds directly to cart
3. **ToppingsModal** (if opened):
   - Shows product image, name, description
   - Product quantity selector (default: 1)
   - List of allowed toppings with:
     - Emoji icon
     - Name and description
     - Price per topping
     - Quantity selector for each topping
   - Real-time total calculation
   - "Add to Cart" button
4. **Cart Page**: 
   - Shows product with selected toppings listed below
   - Displays topping emoji, name, quantity, and price
   - Total includes all toppings
5. **Quantity Changes**:
   - Topping quantities are per cake
   - Increasing product quantity multiplies topping cost
   - Example: 2 cakes × (1 chocolate chips + 2 strawberries) per cake

### 5. Pricing Logic

**Example:**
- Base Cake: ₹1,200
- Chocolate Chips (top001): ₹80
- Strawberries (top002): ₹120

**Scenario 1:** Customer orders 1 cake with 1 chocolate chips and 2 strawberries
```
Total = (1200 × 1) + (80 × 1 × 1) + (120 × 2 × 1)
Total = 1200 + 80 + 240 = ₹1,520
```

**Scenario 2:** Customer orders 2 cakes with 1 chocolate chips and 2 strawberries per cake
```
Total = (1200 × 2) + (80 × 1 × 2) + (120 × 2 × 2)
Total = 2400 + 160 + 480 = ₹3,040
```

### 6. Cart Storage

Cart items are stored in localStorage with this structure:

```json
{
  "items": [
    {
      "product": { /* Product object */ },
      "quantity": 2,
      "selectedToppings": [
        {
          "topping": { /* Topping object */ },
          "quantity": 1
        },
        {
          "topping": { /* Topping object */ },
          "quantity": 2
        }
      ]
    }
  ],
  "total": 3040
}
```

### 7. Deployment Checklist

- [ ] Add `allowed_toppings` column to Products tab in Google Sheet
- [ ] Ensure Toppings tab exists with sample data
- [ ] Update Google Apps Script `Code.gs` with new column
- [ ] Redeploy Apps Script as Web App
- [ ] Update frontend code (already done if using latest version)
- [ ] Test: Add product without toppings (should go directly to cart)
- [ ] Test: Add product with toppings (should open modal)
- [ ] Test: Select multiple toppings with different quantities
- [ ] Test: Cart displays selected toppings correctly
- [ ] Test: Total calculation includes topping prices
- [ ] Test: Quantity changes in cart affect topping totals

### 8. Troubleshooting

**Modal doesn't appear:**
- Check if product has `allowed_toppings` filled in Google Sheet
- Verify topping IDs match exactly (case-insensitive)
- Check browser console for errors

**Toppings not showing in modal:**
- Verify Toppings tab exists in Google Sheet
- Check `is_available` is TRUE for toppings
- Ensure topping IDs in `allowed_toppings` match Toppings tab IDs

**Price calculation wrong:**
- Verify topping `price_inr` values in Google Sheet are numbers, not text
- Check product quantity is being multiplied correctly
- Review cart total calculation in browser console

**Cart shows wrong toppings:**
- Clear localStorage: `localStorage.clear()` in browser console
- Refresh page and try again

### 9. Future Enhancements

Potential improvements:
- Allow required vs optional toppings
- Set min/max quantities per topping
- Group toppings by category (Fruits, Chocolates, etc.)
- Topping recommendations based on product
- Topping images in addition to emojis
- Bulk discount for multiple toppings
- Seasonal/limited-time toppings

---

## Quick Reference

### File Changes Summary

**New Files:**
- `components/ToppingsModal.tsx` - Modal for topping selection

**Modified Files:**
- `types/index.ts` - Added `SelectedTopping`, updated `Product` and `CartItem`
- `lib/cart.ts` - Updated `addToCart()` and `calculateTotal()` with topping logic
- `components/ProductCard.tsx` - Added modal trigger and topping props
- `components/CartItemCard.tsx` - Display selected toppings and correct totals
- `app/page.tsx` - Fetch toppings and pass to ProductCard
- `google-apps-script/Code.gs` - Added `allowed_toppings` to product response
- `google-sheets-setup/SHEETS_SETUP_GUIDE.md` - Documented new columns

### Google Sheets Columns

**Products Tab (9 columns):**
1. id
2. name
3. description
4. price_inr
5. image_url
6. category
7. is_available
8. sort_order
9. **allowed_toppings** ← NEW

**Toppings Tab (7 columns):**
1. id
2. name
3. description
4. price_inr
5. icon_emoji
6. is_available
7. sort_order

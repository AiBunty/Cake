# Prompt for Gemini: Set Up Toppings System in Google Sheets

Copy and paste this prompt to Gemini to get help setting up your Google Sheets for the topping selection feature:

---

**PROMPT START:**

I need to add a topping selection system to my cake ordering website. I'm using Google Sheets as my database and need help setting up the required columns and sample data.

## Current Setup
I have a Google Sheet with these tabs:
- **Products** tab (currently has 8 columns)
- **Toppings** tab (may or may not exist yet)

## What I Need

### 1. Update Products Tab - Add Column I
The Products tab currently has these columns (A-H):
```
A: id
B: name
C: description
D: price_inr
E: image_url
F: category
G: is_available
H: sort_order
```

**Add a new Column I:**
- Column Header: `allowed_toppings`
- Purpose: Links specific toppings to each product using topping IDs
- Format: Space or comma-separated topping IDs (e.g., "top001 top005 top008")
- Leave empty if product doesn't need topping selection

### 2. Create or Verify Toppings Tab
Create a new tab called **Toppings** with these columns:

**Column Headers (Row 1):**
```
A: id
B: name
C: description
D: price_inr
E: icon_emoji
F: is_available
G: sort_order
```

**Sample Data (Rows 2-9):**
```
Row 2: top001 | Extra Chocolate Chips | Premium dark chocolate chips | 80 | 🍫 | TRUE | 1
Row 3: top002 | Fresh Strawberries | Hand-picked fresh strawberries | 120 | 🍓 | TRUE | 2
Row 4: top003 | Caramel Drizzle | Homemade salted caramel | 60 | 🍯 | TRUE | 3
Row 5: top004 | Edible Gold Flakes | 24K edible gold decoration | 250 | ✨ | TRUE | 4
Row 6: top005 | Whipped Cream | Fresh dairy whipped cream | 50 | 🥛 | TRUE | 5
Row 7: top006 | Chocolate Ganache | Rich dark chocolate coating | 100 | 🍫 | TRUE | 6
Row 8: top007 | Crushed Nuts | Roasted mixed nuts topping | 70 | 🥜 | TRUE | 7
Row 9: top008 | Fresh Berries Mix | Blueberries and raspberries | 150 | 🫐 | TRUE | 8
```

### 3. Update Products Tab - Add Sample allowed_toppings Data
For existing products in Products tab, add values to new Column I:

**Examples:**
- Chocolate cakes: `top001 top005 top006 top007` (chocolate chips, whipped cream, ganache, nuts)
- Fruit cakes: `top002 top003 top008` (strawberries, caramel, berries)
- Premium cakes: `top001 top002 top004 top005 top008` (chips, strawberries, gold, cream, berries)
- Simple cakes: `top003 top005` (caramel, whipped cream)
- Leave empty for products that don't allow toppings

## Instructions for Implementation

Please provide me with:

1. **Step-by-step instructions** to add Column I to my Products tab without disrupting existing data
2. **The exact formula or method** to create the Toppings tab with sample data
3. **Sample values** for the `allowed_toppings` column based on my existing product categories (Birthday, Wedding, Anniversary, Custom, Cupcakes, Pastries)
4. **Validation rules** to ensure data consistency (e.g., only allow topping IDs that exist in Toppings tab)
5. **Tips** for maintaining this data structure when adding new products or toppings

## Additional Context
- My Products tab already has products like: Chocolate Delight, Vanilla Dream, Red Velvet, Strawberry Bliss, etc.
- Prices are in Indian Rupees (INR)
- The website reads this data via Google Apps Script Web App
- Topping prices are additional costs added to the product base price
- Multiple toppings can be selected per product
- Same product with different toppings = separate cart items

## Expected Output Format
Please provide:
1. Google Sheets formulas (if needed)
2. Copy-paste ready data for Toppings tab
3. Suggested `allowed_toppings` values for each product category
4. Any Google Apps Script snippets if validation is needed

**PROMPT END**

---

## Alternative Shorter Prompt (if character limit is an issue):

I'm adding a topping selection feature to my cake website using Google Sheets as database.

**Need to add:**
1. Column I "allowed_toppings" to Products tab (format: "top001 top005 top008")
2. New Toppings tab with columns: id, name, description, price_inr, icon_emoji, is_available, sort_order

**Sample topping data needed:**
- Chocolate chips, strawberries, caramel, gold flakes, whipped cream, ganache, nuts, berries
- IDs: top001-top008
- Prices: ₹50-₹250
- Include emojis

Help me set this up with step-by-step instructions and sample data for both tabs.

import { Cart, CartItem, Product, SelectedTopping } from "@/types";

const CART_STORAGE_KEY = "cake_cart";

export const getCart = (): Cart => {
  if (typeof window === "undefined") {
    return { items: [], total: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], total: 0 };
    }
    const cart: Cart = JSON.parse(stored);
    return cart;
  } catch {
    return { items: [], total: 0 };
  }
};

export const saveCart = (cart: Cart): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const addToCart = (
  product: Product, 
  quantity: number = 1,
  selectedToppings?: SelectedTopping[]
): Cart => {
  const cart = getCart();
  
  // Check if same product with same toppings exists
  const existingItemIndex = cart.items.findIndex((item) => {
    if (item.product.id !== product.id) return false;
    
    // Compare toppings
    const itemToppings = item.selectedToppings || [];
    const newToppings = selectedToppings || [];
    
    if (itemToppings.length !== newToppings.length) return false;
    
    // Check if all toppings match
    return itemToppings.every((itemTopping) => {
      const matchingTopping = newToppings.find(
        (t) => t.topping.id === itemTopping.topping.id
      );
      return matchingTopping && matchingTopping.quantity === itemTopping.quantity;
    });
  });

  if (existingItemIndex >= 0) {
    // Same product with same toppings - just increase quantity
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // New item with different toppings or first time
    cart.items.push({ 
      product, 
      quantity,
      selectedToppings: selectedToppings || []
    });
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
};

export const updateQuantity = (productId: string, quantity: number): Cart => {
  const cart = getCart();
  const itemIndex = cart.items.findIndex(
    (item) => item.product.id === productId
  );

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
};

export const updateQuantityByIndex = (itemIndex: number, quantity: number): Cart => {
  const cart = getCart();

  if (itemIndex >= 0 && itemIndex < cart.items.length) {
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: string): Cart => {
  return updateQuantity(productId, 0);
};

export const removeFromCartByIndex = (itemIndex: number): Cart => {
  return updateQuantityByIndex(itemIndex, 0);
};

export const clearCart = (): Cart => {
  const emptyCart: Cart = { items: [], total: 0 };
  saveCart(emptyCart);
  return emptyCart;
};

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    // Product price
    let itemTotal = item.product.price_inr * item.quantity;
    
    // Add toppings price
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      const toppingsTotal = item.selectedToppings.reduce(
        (toppingSum, selectedTopping) => 
          toppingSum + (selectedTopping.topping.price_inr * selectedTopping.quantity * item.quantity),
        0
      );
      itemTotal += toppingsTotal;
    }
    
    return sum + itemTotal;
  }, 0);
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

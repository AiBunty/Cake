import { Cart, CartItem, Product } from "@/types";

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

export const addToCart = (product: Product, quantity: number = 1): Cart => {
  const cart = getCart();
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.id === product.id
  );

  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product, quantity });
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

export const removeFromCart = (productId: string): Cart => {
  return updateQuantity(productId, 0);
};

export const clearCart = (): Cart => {
  const emptyCart: Cart = { items: [], total: 0 };
  saveCart(emptyCart);
  return emptyCart;
};

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + item.product.price_inr * item.quantity,
    0
  );
};

export const getCartCount = (): number => {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

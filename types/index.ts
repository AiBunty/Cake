// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  image_url: string;
  category: string;
  is_available: boolean;
  sort_order: number;
  allowed_toppings?: string; // Space or comma-separated topping IDs (e.g., "top001 top005")
}

// Topping types
export interface Topping {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  icon_emoji: string;
  is_available: boolean;
  sort_order: number;
}

// Settings types
export interface Settings {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  delivery_days?: string;
  min_order_value?: string;
  timezone?: string;
  currency?: string;
  [key: string]: any;
}

// Time slot types
export interface TimeSlot {
  date: string; // YYYY-MM-DD
  slot_label: string;
  start_time: string; // HH:MM 24h
  end_time: string; // HH:MM 24h
  max_orders: number;
  is_open: boolean;
  available_slots?: number;
}

// Cart types
export interface SelectedTopping {
  topping: Topping;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedToppings?: SelectedTopping[];
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Order types
export interface OrderData {
  customer_name: string;
  phone: string;
  email: string;
  pickup_date: string;
  pickup_slot_label: string;
  pickup_start_time: string;
  pickup_end_time: string;
  pickup_timezone: string;
  cart_json: string;
  subtotal_inr: number;
  notes?: string;
}

export interface Order extends OrderData {
  order_id: string;
  created_at: string;
  payment_status: "CREATED" | "PAID" | "FAILED";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

// Razorpay types
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: string;
}

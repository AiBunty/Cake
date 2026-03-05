import { ApiResponse } from "@/types";
import {
  getCachedProducts,
  setCachedProducts,
  getCachedToppings,
  setCachedToppings,
  getCachedSettings,
  setCachedSettings,
  getCachedTimeSlots,
  setCachedTimeSlots,
} from "@/lib/cache";

const APPS_SCRIPT_BASE_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_BASE_URL || "";
const APPS_SCRIPT_API_KEY =
  process.env.APPS_SCRIPT_API_KEY || process.env.NEXT_PUBLIC_APPS_SCRIPT_API_KEY || "";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer ? APPS_SCRIPT_BASE_URL : "/api/apps-script";

export const appsScriptFetch = async <T>(
  route: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<ApiResponse<T>> => {
  try {
    if (!API_BASE_URL) {
      throw new Error("Apps Script base URL is not configured");
    }

    const url = API_BASE_URL.startsWith("http")
      ? new URL(API_BASE_URL)
      : new URL(
          API_BASE_URL,
          typeof window !== "undefined" ? window.location.origin : "http://localhost"
        );
    url.searchParams.set("route", route);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(isServer && APPS_SCRIPT_API_KEY
          ? { "x-api-key": APPS_SCRIPT_API_KEY }
          : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error("Apps Script API error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getProducts = async (skipCache = false) => {
  // Check cache first (unless skipped)
  if (!skipCache) {
    const cached = getCachedProducts();
    if (cached) {
      console.log("📦 Using cached products");
      return { ok: true, data: cached };
    }
  }

  // Fetch from API
  const response = await appsScriptFetch("products", { method: "GET" });
  
  // Cache the result
  if (response.ok && response.data) {
    setCachedProducts(response.data as any);
    console.log("📦 Products cached for offline use");
  }
  
  return response;
};

export const getToppings = async (skipCache = false) => {
  // Check cache first
  if (!skipCache) {
    const cached = getCachedToppings();
    if (cached) {
      console.log("🍫 Using cached toppings");
      return { ok: true, data: cached };
    }
  }

  // Fetch from API
  const response = await appsScriptFetch("toppings", { method: "GET" });
  
  // Cache the result
  if (response.ok && response.data) {
    setCachedToppings(response.data as any);
    console.log("🍫 Toppings cached for offline use");
  }
  
  return response;
};

export const getSettings = async (skipCache = false) => {
  // Check cache first
  if (!skipCache) {
    const cached = getCachedSettings();
    if (cached) {
      console.log("⚙️  Using cached settings");
      return { ok: true, data: cached };
    }
  }

  // Fetch from API
  const response = await appsScriptFetch("settings", { method: "GET" });
  
  // Cache the result
  if (response.ok && response.data) {
    setCachedSettings(response.data as any);
    console.log("⚙️  Settings cached for offline use");
  }
  
  return response;
};
export const getTimeSlots = async (date: string, skipCache = false) => {
  // Check cache first
  if (!skipCache) {
    const cached = getCachedTimeSlots(date);
    if (cached) {
      console.log(`⏰ Using cached time slots for ${date}`);
      return { ok: true, data: cached };
    }
  }

  // Fetch from API
  const response = await appsScriptFetch("timeslots", {
    method: "GET",
    params: { date },
  });
  
  // Cache the result
  if (response.ok && response.data) {
    setCachedTimeSlots(date, response.data as any);
    console.log(`⏰ Time slots for ${date} cached for offline use`);
  }
  
  return response;
};

export const createOrder = async (orderData: unknown) => {
  return appsScriptFetch("orders_create", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const markOrderPaid = async (paymentData: unknown) => {
  return appsScriptFetch("payments_mark_paid", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
};

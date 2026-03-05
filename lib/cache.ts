// Data caching utilities for Google Sheets data

import { Product, Topping, TimeSlot, Settings } from '@/types';

const CACHE_KEYS = {
  products: 'cake_studio_cache_products',
  toppings: 'cake_studio_cache_toppings',
  settings: 'cake_studio_cache_settings',
  timeSlots: (date: string) => `cake_studio_cache_timeslots_${date}`,
};

const CACHE_EXPIRY_MS = {
  products: 60 * 60 * 1000, // 1 hour
  toppings: 60 * 60 * 1000, // 1 hour
  settings: 24 * 60 * 60 * 1000, // 24 hours
  timeSlots: 12 * 60 * 60 * 1000, // 12 hours
};

export type CachedData<T> = {
  data: T;
  timestamp: number;
  expiry: number;
};

// Helper to get cached data
const getFromCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const cached: CachedData<T> = JSON.parse(stored);
    const isExpired = Date.now() > cached.timestamp + cached.expiry;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
};

// Helper to save to cache
const saveToCache = <T>(key: string, data: T, expiryMs: number) => {
  if (typeof window === 'undefined') return;

  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry: expiryMs,
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.error(`Error saving cache for ${key}:`, error);
  }
};

// Cache management functions for each data type

export const getCachedProducts = (): Product[] | null => {
  return getFromCache<Product[]>(CACHE_KEYS.products);
};

export const setCachedProducts = (products: Product[]) => {
  saveToCache(CACHE_KEYS.products, products, CACHE_EXPIRY_MS.products);
};

export const getCachedToppings = (): Topping[] | null => {
  return getFromCache<Topping[]>(CACHE_KEYS.toppings);
};

export const setCachedToppings = (toppings: Topping[]) => {
  saveToCache(CACHE_KEYS.toppings, toppings, CACHE_EXPIRY_MS.toppings);
};

export const getCachedSettings = (): Settings | null => {
  return getFromCache<Settings>(CACHE_KEYS.settings);
};

export const setCachedSettings = (settings: Settings) => {
  saveToCache(CACHE_KEYS.settings, settings, CACHE_EXPIRY_MS.settings);
};

export const getCachedTimeSlots = (date: string): TimeSlot[] | null => {
  return getFromCache<TimeSlot[]>(CACHE_KEYS.timeSlots(date));
};

export const setCachedTimeSlots = (date: string, slots: TimeSlot[]) => {
  saveToCache(CACHE_KEYS.timeSlots(date), slots, CACHE_EXPIRY_MS.timeSlots);
};

// Clear all caches
export const clearAllCaches = () => {
  if (typeof window === 'undefined') return;

  try {
    Object.values(CACHE_KEYS).forEach((key) => {
      if (typeof key === 'string') {
        localStorage.removeItem(key);
      }
    });
    // Also clear date-based cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cake_studio_cache_timeslots_')) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

// Get cache status
export const getCacheStatus = () => {
  const products = getCachedProducts();
  const toppings = getCachedToppings();
  const settings = getCachedSettings();

  return {
    products: {
      cached: !!products,
      count: products?.length || 0,
    },
    toppings: {
      cached: !!toppings,
      count: toppings?.length || 0,
    },
    settings: {
      cached: !!settings,
    },
  };
};

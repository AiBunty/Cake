'use client';

import { useEffect } from 'react';
import { getProducts, getToppings, getSettings } from '@/lib/api';
import { getMinPickupDate } from '@/lib/utils';

/**
 * Background Data Loader
 * 
 * This component loads and caches Google Sheets data in the background
 * when the app first loads, ensuring fast navigation and offline support.
 */
export default function BackgroundDataLoader() {
  useEffect(() => {
    const loadDataInBackground = async () => {
      try {
        console.log('🔄 Starting background data cache...');

        // Load all critical data with caching
        const [products, toppings, settings] = await Promise.all([
          getProducts(false), // Use cache if available
          getToppings(false),
          getSettings(false),
        ]);

        console.log('✅ Background data cache complete');

        // Log cache status
        if (products.ok && Array.isArray(products.data)) console.log(`✓ Cached ${products.data.length} products`);
        if (toppings.ok && Array.isArray(toppings.data)) console.log(`✓ Cached ${toppings.data.length} toppings`);
        if (settings.ok) console.log('✓ Cached company settings');

        // Optional: Pre-load today's time slots
        const today = getMinPickupDate();
        // Optionally fetch today's slots in background
        // This can be expanded as needed
      } catch (error) {
        console.error('Error loading background data:', error);
      }
    };

    // Start background loading after a short delay to not block initial render
    const timer = setTimeout(loadDataInBackground, 500);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}

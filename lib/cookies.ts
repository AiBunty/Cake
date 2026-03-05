// Cookie consent management utilities

const COOKIE_CONSENT_KEY = 'cake_studio_cookie_consent';
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

export type CookieConsent = {
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  necessary: boolean; // Always true
  timestamp: number;
};

export const getCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
};

export const setCookieConsent = (consent: Omit<CookieConsent, 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  
  try {
    const consentData: CookieConsent = {
      ...consent,
      necessary: true, // Always required
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    
    // Set actual cookies based on consent
    if (consent.analytics) {
      // Set analytics cookie (e.g., for Google Analytics)
      setCookie('_ga_consent', 'true', COOKIE_CONSENT_EXPIRY_DAYS);
    }
    if (consent.marketing) {
      // Set marketing cookie
      setCookie('_marketing_consent', 'true', COOKIE_CONSENT_EXPIRY_DAYS);
    }
    if (consent.preferences) {
      // Set preferences cookie
      setCookie('_preferences_consent', 'true', COOKIE_CONSENT_EXPIRY_DAYS);
    }
  } catch (error) {
    console.error('Error setting cookie consent:', error);
  }
};

export const acceptAllCookies = () => {
  setCookieConsent({
    analytics: true,
    marketing: true,
    preferences: true,
  });
};

export const rejectAllCookies = () => {
  setCookieConsent({
    analytics: false,
    marketing: false,
    preferences: false,
  });
};

// Helper to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

// Check if consent has been given
export const hasConsentGiven = (): boolean => {
  return getCookieConsent() !== null;
};

// Check if specific cookie category is consented
export const isConsentGiven = (category: keyof Omit<CookieConsent, 'timestamp'>): boolean => {
  const consent = getCookieConsent();
  return consent ? consent[category] : false;
};

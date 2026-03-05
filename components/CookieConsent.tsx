'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hasConsentGiven, acceptAllCookies, rejectAllCookies } from '@/lib/cookies';
import { ChevronDown } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = hasConsentGiven();
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    rejectAllCookies();
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-6xl mx-auto bg-[var(--panel)] border border-[var(--stroke)] rounded-2xl shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="p-6 sm:p-8">
              {/* Main Message */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-playfair font-bold text-[var(--text)] mb-3">
                  🍪 Cookies & Data Privacy
                </h3>
                <p className="text-[var(--muted)] text-sm sm:text-base mb-4">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  By accepting, you allow us to collect information about how you use our website.
                </p>

                {/* Details Section */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-[var(--stroke)] space-y-3 text-sm text-[var(--muted)]"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text)] mb-1">📊 Analytics (Recommended)</p>
                        <p>Help us understand user behavior and improve our website.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)] mb-1">📢 Marketing</p>
                        <p>Enable personalized ads and promotional content based on your interests.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)] mb-1">⚙️ Preferences</p>
                        <p>Remember your settings and preferences for a better experience.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)] mb-1">✓ Necessary (Required)</p>
                        <p>Essential for website functionality. Cannot be disabled.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Toggle Details */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-3 flex items-center gap-2 text-rose hover:text-rose/80 transition-colors font-medium text-sm"
                >
                  <span>{showDetails ? 'Hide' : 'Show'} details</span>
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-3 rounded-xl font-medium text-[var(--muted)] bg-[var(--stroke)] hover:bg-[var(--stroke)]/80 transition-colors border border-[var(--stroke)]"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-rose to-violet hover:shadow-lg hover:shadow-rose/30 transition-all border border-transparent"
                >
                  Accept All Cookies
                </button>
              </div>

              {/* Legal Note */}
              <p className="text-xs text-[var(--muted)] mt-4 leading-relaxed">
                We respect your privacy. Your data is never shared with third parties without your consent. 
                Read our <a href="#" className="text-rose hover:underline">Privacy Policy</a> for more information.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

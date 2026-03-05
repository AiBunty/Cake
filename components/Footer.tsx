'use client';

import Link from 'next/link';
import { useSettings } from '@/app/SettingsContext';

export default function Footer() {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <footer className="border-t border-[var(--stroke)] bg-[var(--panel)] py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center text-[var(--muted)]">
          Loading company information...
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[var(--stroke)] bg-[var(--panel)] py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-playfair font-bold text-[var(--text)] mb-4">
              {settings?.company_name || 'Cakeouflage'}
            </h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              {settings?.tagline || 'Premium artisan cakes and desserts'}
            </p>
            {settings?.address && (
              <p className="text-xs text-[var(--muted)]">{settings.address}</p>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wide">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {settings?.company_phone && (
                <li>
                  <a
                    href={`tel:${settings.company_phone}`}
                    className="hover:text-[var(--rose)] transition-colors"
                  >
                    ☎️ {settings.company_phone}
                  </a>
                </li>
              )}
              {settings?.company_phone_2 && (
                <li>
                  <a
                    href={`tel:${settings.company_phone_2}`}
                    className="hover:text-[var(--rose)] transition-colors"
                  >
                    ☎️ {settings.company_phone_2}
                  </a>
                </li>
              )}
              {settings?.company_email && (
                <li>
                  <a
                    href={`mailto:${settings.company_email}`}
                    className="hover:text-[var(--rose)] transition-colors"
                  >
                    ✉️ {settings.company_email}
                  </a>
                </li>
              )}
              {settings?.whatsapp_number && (
                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--rose)] transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wide">
              Follow Us
            </h4>
            <div className="flex gap-4 flex-wrap">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-[var(--rose)] transition-colors"
                  aria-label="Instagram"
                  title="Follow on Instagram"
                >
                  📷
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-[var(--rose)] transition-colors"
                  aria-label="Facebook"
                  title="Follow on Facebook"
                >
                  👍
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-[var(--rose)] transition-colors"
                  aria-label="Twitter"
                  title="Follow on Twitter"
                >
                  𝕏
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--stroke)] pt-6">
          <p className="text-center text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} {settings?.company_name || 'Cakeouflage'}. All rights reserved.
          </p>
          <p className="text-center text-xs text-[var(--muted)] mt-2">
            Made with ♡ for cake lovers
          </p>
        </div>
      </div>
    </footer>
  );
}

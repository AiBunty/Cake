import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./SettingsContext";
import CookieConsent from "@/components/CookieConsent";
import BackgroundDataLoader from "@/components/BackgroundDataLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cake Studio - Premium Artisan Cakes",
  description: "Order your favorite artisan cakes for pickup or book a custom consultation",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <SettingsProvider>
          <BackgroundDataLoader />
          <div className="floating-blobs" aria-hidden="true"></div>
          <div className="spotlight-container">
            {children}
          </div>
          <CookieConsent />
        </SettingsProvider>
      </body>
    </html>
  );
}

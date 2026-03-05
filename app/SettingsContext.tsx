'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Settings } from '@/types';
import { getSettings as fetchSettings } from '@/lib/api';

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  error: null,
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetchSettings();
        if (response.ok && response.data) {
          setSettings(response.data);
        } else {
          setError(response.error || 'Failed to load settings');
          // Set default fallback settings
          setSettings({
            company_name: 'Cakeouflage',
            company_phone: '',
            timezone: 'Asia/Kolkata',
            currency: 'INR',
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        // Set default fallback settings
        setSettings({
          company_name: 'Cakeouflage',
          company_phone: '',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

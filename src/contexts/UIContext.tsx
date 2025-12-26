'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface UIState {
  currentUser: User;
  preferredCurrency: string;
  preferredLocale: string;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  updateSettings: (currency: string, locale: string) => void;
  updateUser: (user: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'u1',
  name: 'Kai',
  email: 'kai@oweno.ph',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=b6e3f4'
};

const UIContext = createContext<UIState | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('oweno_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_USER;
        }
      }
    }
    return DEFAULT_USER;
  });
  const [preferredCurrency, setPreferredCurrency] = useState('PHP');
  const [preferredLocale, setPreferredLocale] = useState('en-PH');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persist user to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('oweno_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const updateUser = useCallback((user: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...user };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('oweno_user', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const updateSettings = useCallback((currency: string, locale: string) => {
    setPreferredCurrency(currency);
    setPreferredLocale(locale);
  }, []);

  const value: UIState = {
    currentUser,
    preferredCurrency,
    preferredLocale,
    isSidebarOpen,
    isSettingsOpen,
    setSidebarOpen: setIsSidebarOpen,
    setSettingsOpen: setIsSettingsOpen,
    updateSettings,
    updateUser,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIStore = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIStore must be used within a UIProvider');
  }
  return context;
};


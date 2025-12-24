'use client';

import { create } from 'zustand';
import { User } from '../types';

interface UIState {
  currentUser: User;
  isAuthenticated: boolean;
  preferredCurrency: string;
  preferredLocale: string;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  updateSettings: (currency: string, locale: string) => void;
  updateUser: (user: Partial<User>) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
}

// Persist auth state in localStorage for better UX
const savedAuth = typeof window !== 'undefined' ? window.localStorage.getItem('oweno_auth') === 'true' : false;
const savedUser = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('oweno_user') || 'null') : null;

const DEFAULT_USER = {
  id: 'u1',
  name: 'Kai',
  email: 'kai@oweno.ph',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=b6e3f4'
};

export const useUIStore = create<UIState>((set) => ({
  currentUser: savedUser || DEFAULT_USER,
  isAuthenticated: savedAuth,
  preferredCurrency: 'PHP',
  preferredLocale: 'en-PH',
  isSidebarOpen: false,
  isSettingsOpen: false,
  
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  
  updateSettings: (currency, locale) => set({ preferredCurrency: currency, preferredLocale: locale }),
  
  updateUser: (user) => set((state) => {
    const updatedUser = { ...state.currentUser, ...user };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('oweno_user', JSON.stringify(updatedUser));
    }
    return { currentUser: updatedUser };
  }),

  login: (email: string, name?: string) => {
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email: email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&backgroundColor=b6e3f4`
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('oweno_auth', 'true');
      window.localStorage.setItem('oweno_user', JSON.stringify(user));
    }
    set({ isAuthenticated: true, currentUser: user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('oweno_auth');
      window.localStorage.removeItem('oweno_user');
    }
    set({ isAuthenticated: false });
  }
}));


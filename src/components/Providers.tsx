'use client';

import { UIProvider } from '@/contexts/UIContext';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ClerkProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </ClerkProvider>
  );
};


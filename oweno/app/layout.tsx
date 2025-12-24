import React from 'react';
import { Layout as MainLayout } from '../components/Layout';
import { Providers } from '../components/Providers';

/**
 * RootLayout component that wraps the application with necessary providers and the main layout.
 * We make children optional in the type definition to satisfy strict TS checks in consumers
 * where the JSX parser might not correctly infer the presence of children.
 */
export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <Providers>
      <MainLayout>
        {children}
      </MainLayout>
    </Providers>
  );
}

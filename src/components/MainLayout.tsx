'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './shared/Header';
import Footer from './shared/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {pathname === '/' ? (
        <main className="flex-grow pt-16">{children}</main>
      ) : (
        <main className="flex-grow pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
              {children}
            </div>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default MainLayout;

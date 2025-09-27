'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />$
      {pathname === '/' ? (
        <main className="h-screen flex-grow pt-16 flex items-center justify-center">
          {children}
        </main>
      ) : (
        <main className="flex-grow pt-16">
          <div
            className={`mx-auto px-4 sm:px-6 lg:px-8 ${pathname === '/' ? 'h-100' : 'max-w-7xl '}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {children}
            </div>
          </div>
        </main>
      )}
      {/* Main content with top padding to account for fixed header */}
      <Footer />
    </div>
  );
};

export default MainLayout;

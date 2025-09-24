import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main content with top padding to account for fixed header */}
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive grid container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;

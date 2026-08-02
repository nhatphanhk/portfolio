import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { VisitorModal } from './VisitorModal';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main public layout — wraps Header, content, and Footer.
 * Used by all public-facing pages.
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <VisitorModal />
    </div>
  );
};

export default MainLayout;

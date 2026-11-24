import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { VisitorModal } from './VisitorModal';
import { PageViewTracker } from './PageViewTracker';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main public layout — wraps Header, content, and Footer.
 * Used by all public-facing pages.
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen w-full max-w-full flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow w-full max-w-full min-w-0">{children}</main>
      <Footer />
      <VisitorModal />
      <PageViewTracker />
    </div>
  );
};

export default MainLayout;

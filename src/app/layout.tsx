import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/i18n/context';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, buildOpenGraph } from '@/lib/constants';
import { getServerLocale } from '@/lib/i18n/server';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  icons: {
    // One real asset: declaring fake 32/192/512 sizes for the same file misleads browsers
    icon: [{ url: '/icon.png', sizes: '512x592', type: 'image/png' }],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: buildOpenGraph({ title: SITE_NAME, description: SITE_DESCRIPTION, path: '/' }),
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: `@${SITE_NAME}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
          <LanguageProvider initialLocale={locale}>
            {children}
            <Toaster position="bottom-right" />
            <CommandPalette />
            <Analytics />
            <SpeedInsights />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NetWorth — Financial Life Tycoon Simulator',
  description:
    'Build your financial empire from nothing. A premium idle tycoon game combining life simulation, stock trading, business management, and strategic financial planning.',
  keywords: [
    'financial simulator',
    'tycoon game',
    'idle game',
    'life simulator',
    'stock market game',
    'business simulator',
  ],
  authors: [{ name: 'NetWorth Studios' }],
  openGraph: {
    title: 'NetWorth — Financial Life Tycoon Simulator',
    description: 'Build your financial empire from nothing.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D0D0D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

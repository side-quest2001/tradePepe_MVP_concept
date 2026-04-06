import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TradePepe Frontend',
  description: 'Trade analytics dashboard and journal frontend built with Next.js.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

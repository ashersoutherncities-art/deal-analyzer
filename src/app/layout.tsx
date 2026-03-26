import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SFH Deal Analyzer | Southern Cities Enterprises',
  description:
    'Professional single-family home deal analysis tool. Calculate ARV, hard money loans, BRRRR refinance, rental income, and returns with industry-standard formulas.',
  keywords: 'real estate, deal analyzer, SFH, ARV, BRRRR, hard money, cash flow, investment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

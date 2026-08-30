import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pgrankpredictor.tabindia.org'),
  title: 'NEET PG 2026 Rank Predictor | TAB India',
  description: 'Enter your NEET PG score out of 720 and estimate your 2026 All India Rank based on NEET PG 2025 data.',
  openGraph: {
    title: 'NEET PG 2026 Rank Predictor | TAB India',
    description: 'Estimate your AIR from your score using NEET PG 2025 data.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'TAB India NEET PG 2026 Rank Predictor' }],
  },
  twitter: { card: 'summary_large_image', title: 'NEET PG 2026 Rank Predictor | TAB India', description: 'Estimate your AIR from your score using NEET PG 2025 data.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

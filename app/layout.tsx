import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEET PG 2026 Rank Predictor | TAB India',
  description: 'Enter your NEET PG score out of 720 and instantly estimate your 2026 All India Rank using TAB India marks-versus-rank data.',
  openGraph: {
    title: 'NEET PG 2026 Rank Predictor | TAB India',
    description: 'Know your estimated AIR in seconds.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'TAB India NEET PG 2026 Rank Predictor' }],
  },
  twitter: { card: 'summary_large_image', title: 'NEET PG 2026 Rank Predictor | TAB India', description: 'Know your estimated AIR in seconds.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

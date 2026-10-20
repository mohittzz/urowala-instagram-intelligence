import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UROWALA Instagram Reel Intelligence | Dr. Mohit Sharma',
  description: 'Private production analytics intelligence dashboard for @dr.mohit_urowala Instagram Reels.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}

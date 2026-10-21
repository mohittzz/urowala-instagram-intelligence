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
    <html lang="en" className="dark">
      <body className="antialiased text-slate-100 bg-[#0c0712] min-h-screen">
        {children}
      </body>
    </html>
  );
}

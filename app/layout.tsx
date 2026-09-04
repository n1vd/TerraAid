import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://terraaid-sih2026-relief-intelligence.modutec-indi-9278.chatgpt.site'),
  title: 'TerraAid — Farm Relief Intelligence',
  description: 'Satellite-assisted flood damage assessment and field verification prioritisation for agricultural relief teams.',
  openGraph: {
    title: 'TerraAid — Farm Relief Intelligence',
    description: 'Find the farms relief may have missed.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'TerraAid flood-relief intelligence' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TerraAid — Farm Relief Intelligence',
    description: 'Find the farms relief may have missed.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

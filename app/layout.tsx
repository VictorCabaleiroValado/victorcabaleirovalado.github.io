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
  metadataBase: new URL('https://victorcabaleirovalado.github.io'),
  alternates: {canonical: '/'},
  openGraph: {type: 'website', url: 'https://victorcabaleirovalado.github.io/', title: 'Victor Cabaleiro Valado | Professional Portfolio', description: 'Data analytics, applied AI and engineering. Explore my experience, rotary machine fault diagnosis project, toolkit and education.', images: [{url: 'https://victorcabaleirovalado.github.io/portfolio-preview.png', width: 1200, height: 630, alt: 'Victor Cabaleiro Valado'}]},
  twitter: {card: 'summary_large_image', title: 'Victor Cabaleiro Valado | Professional Portfolio', images: ['https://victorcabaleirovalado.github.io/portfolio-preview.png']},
  title: 'Victor Cabaleiro Valado | Data Analytics & Applied AI',
  description: 'Engineering, statistics and applied AI. Explore Victor Cabaleiro Valado’s experience, machine learning project and résumé.',
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

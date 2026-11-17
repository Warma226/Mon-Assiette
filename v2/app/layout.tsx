import type { Metadata, Viewport } from 'next';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { SwRegister } from '@/components/SwRegister';
import { Toaster } from '@/components/Toast';

export const metadata: Metadata = {
  title: { default: 'Mon Assiette', template: '%s · Mon Assiette' },
  description: 'Mieux choisir. Mieux manger. Ton compagnon pour savoir quoi manger, avec les plats de chez toi.',
  applicationName: 'Mon Assiette',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/favicon-48.png', apple: '/icons/icon-192.png' },
  appleWebApp: { capable: true, title: 'Mon Assiette', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#6C3CF0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <BottomNav />
        <SwRegister />
        <Toaster />
      </body>
    </html>
  );
}

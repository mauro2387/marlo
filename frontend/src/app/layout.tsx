import type { Metadata } from 'next';
import { Nunito, Pacifico } from 'next/font/google';
import './globals.css';
import MiniCart from '@/components/MiniCart';
import NotificationContainer from '@/components/NotificationContainer';
import ActiveOrderBanner from '@/components/ActiveOrderBanner';
import CookieBanner from '@/components/CookieBanner';
import { AuthProvider } from '@/components/AuthProvider';
import MetaPixel from '@/components/MetaPixel';
import MaintenanceMode from '@/components/MaintenanceMode';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pacifico',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MarLo Cookies - Las mejores cookies artesanales de Uruguay',
  description:
    'Disfruta de las cookies más deliciosas y artesanales de Maldonado. Cookies clásicas, especiales, box personalizados y más. Sistema de puntos y envío a domicilio.',
  keywords:
    'cookies, cookies artesanales, postres, box de cookies, MarLo Cookies, Uruguay, Maldonado',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'MarLo Cookies - Las mejores cookies artesanales de Uruguay',
    description: 'Disfruta de las cookies más deliciosas y artesanales de Maldonado. Sistema de puntos y envío a domicilio.',
    images: ['/logo.png'],
    locale: 'es_UY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarLo Cookies - Las mejores cookies artesanales de Uruguay',
    description: 'Disfruta de las cookies más deliciosas y artesanales de Maldonado.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <html lang="es" className={`${nunito.variable} ${pacifico.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="facebook-domain-verification" content="2zn6l14wjy6jown8n8oqrlrip6ywkq" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=shopping_bag"
        />
      </head>
      <body className={nunito.className} suppressHydrationWarning>
        <MetaPixel />
        {isMaintenanceMode ? (
          <MaintenanceMode />
        ) : (
          <AuthProvider>
            {children}
            <MiniCart />
            <NotificationContainer />
            <ActiveOrderBanner />
            <CookieBanner />
          </AuthProvider>
        )}
      </body>
    </html>
  );
}

import { siteConfig } from '@/data/siteConfig';
import AppProviders from '@/components/scroll/AppProviders';
import './value-latam.scss';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url),
  title: {
    default: 'Value Latam | Consultoría financiera integral',
    template: '%s | Value Latam',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'Value Latam',
    'consultoría financiera',
    'financiamiento empresas',
    'mercado de capitales',
    'liquidez empresarial',
    'medios de pago',
    'automatización con IA',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Value Latam | Consultoría financiera integral',
    description: 'Financiamiento, liquidez, medios de pago y automatización con IA para empresas.',
    url: '/',
    siteName: siteConfig.name,
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/value-latam-og.svg', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Value Latam | Consultoría financiera integral',
    description: 'Financiamiento, liquidez, medios de pago y automatización con IA para empresas.',
    images: ['/value-latam-og.svg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/value-latam-logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
<html lang="es-AR" suppressHydrationWarning>
        <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

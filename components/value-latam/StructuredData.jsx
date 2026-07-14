import { siteConfig } from '@/data/siteConfig';

export default function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/value-latam-logo.png`,
        description: siteConfig.description,
        email: siteConfig.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address,
          addressCountry: 'AR',
        },
        sameAs: [siteConfig.linkedin, siteConfig.instagram],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${siteConfig.url}/#professional-service`,
        name: siteConfig.name,
        url: siteConfig.url,
        image: `${siteConfig.url}/value-latam-og.svg`,
        description: siteConfig.description,
        areaServed: {
          '@type': 'Country',
          name: 'Argentina',
        },
        serviceType: [
          'Consultoría financiera',
          'Financiamiento empresarial',
          'Gestión de liquidez',
          'Medios de pago',
          'Automatización de procesos con IA',
        ],
        parentOrganization: {
          '@id': `${siteConfig.url}/#organization`,
        },
      },
      {
        '@type': 'ContactPoint',
        '@id': `${siteConfig.url}/#contact`,
        contactType: 'sales',
        email: siteConfig.email,
        url: siteConfig.whatsappUrl,
        availableLanguage: ['es-AR'],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

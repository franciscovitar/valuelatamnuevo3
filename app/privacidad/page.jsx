import Link from 'next/link';
import { siteConfig } from '@/data/siteConfig';

export const metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de Value Latam.',
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <section>
        <div className="wrap privacy-shell">
          <Link className="brand privacy-brand" href="/" aria-label="Volver al inicio">
            <img src="/value-latam-logo.png" alt="Value Latam" width={900} height={327} />
          </Link>
          <span className="eyebrow">Legal</span>
          <h1 className="serif">Política de Privacidad</h1>
          <p>Value Latam utiliza los datos enviados a través del formulario únicamente para responder consultas comerciales, coordinar reuniones y preparar una primera evaluación de la necesidad del cliente.</p>
          <p>No vendemos ni compartimos datos personales con terceros para fines publicitarios. La información puede ser utilizada por nuestro equipo para contactar al solicitante por email, teléfono o WhatsApp.</p>
          <p>Para solicitar la actualización o eliminación de tus datos, escribinos a <a href={'mailto:' + siteConfig.email}>{siteConfig.email}</a>.</p>
          <Link className="btn btn-primary" href="/">Volver al inicio</Link>
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';
import { contact, solutionPages } from '@/data/valueLatamContent';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="brand foot-logo" href="/" style={{ marginBottom: 4 }} aria-label="Value Latam - inicio">
              <img src="/value-latam-logo.png" alt="Value Latam" width={900} height={327} />
            </Link>
            <p className="blurb">
              Consultoría financiera integral para empresas. Experiencia senior para ejecutar con claridad en contextos volátiles.
            </p>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 13 }}>
              {contact.email}
              <br />
              WhatsApp {contact.whatsappLabel}
              <br />
              {contact.address}
            </p>
          </div>
          <div>
            <h5>Soluciones</h5>
            <ul>
              <li><Link href={solutionPages.financiamiento.path}>Financiamiento</Link></li>
              <li><Link href={solutionPages.liquidez.path}>Inversiones & Liquidez</Link></li>
              <li><Link href={solutionPages.mediosDePago.path}>Medios de Pago</Link></li>
              <li><Link href={solutionPages.procesosIa.path}>Automatización con IA</Link></li>
            </ul>
          </div>
          <div>
            <h5>Empresa</h5>
            <ul>
              <li><Link href="/#diferencial">Quiénes somos</Link></li>
              <li><Link href="/#equipo">Equipo</Link></li>
              <li><Link href={solutionPages.referenciadores.path}>Referenciadores</Link></li>
              <li><Link href="/#contacto">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h5>Contacto</h5>
            <ul>
              <li><Link href="/#contacto">Agendar una llamada</Link></li>
              <li><a href={'mailto:' + contact.email}>{contact.email}</a></li>
              <li><a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li>Mariano Castex 499 · Piso 3 · Of. 303</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Value Latam. Todos los derechos reservados.</span>
          <span className="social">
            <a href="https://www.linkedin.com/in/value-latam-a60a3137b/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/value.latam/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

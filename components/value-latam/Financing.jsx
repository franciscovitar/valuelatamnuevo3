import Link from 'next/link';
import { financingFeatures } from '@/data/valueLatamContent';
import FeatureGrid from './FeatureGrid';
import SectionHeading from './SectionHeading';

export default function Financing() {
  return (
    <section className="finan" id="financiamiento">
      <div className="wrap">
        <SectionHeading eyebrow="Unidad 01 · Financiamiento" title="Conseguimos el capital que tu empresa necesita." />
        <p className="fin-lede reveal">Somos la única consultoría que releva el <b>mapa completo</b> del financiamiento. En lugar de empujarte a una sola entidad, hacemos un benchmark de todas las alternativas —banca, SGRs y mercado de capitales— comparando tasa efectiva, plazos, garantías y estructura de amortización. Avanzamos con la opción óptima: la menor tasa efectiva total y una estructura de pasivos alineada al perfil de flujos de fondos de tu empresa.</p>
        <FeatureGrid items={financingFeatures} />
        <div className="subunit reveal">
          <span className="su-tag">¿Por qué con nosotros?</span>
          <h3>Somos la única consultoría que ve el mapa completo.</h3>
          <p>Un banco te ofrece su producto; una SGR, el suyo. Nosotros relevamos <b>todo el mapa</b> y hacemos el benchmark entre entidades para avanzar con la opción óptima: la menor tasa efectiva total y una estructura de pasivos alineada al perfil de flujos de fondos de tu empresa. No trabajamos para una entidad: trabajamos para vos.</p>
        </div>
        <div className="fin-cta reveal"><Link className="btn btn-primary" href="/#contacto">Quiero estructurar mi financiamiento</Link></div>
      </div>
    </section>
  );
}

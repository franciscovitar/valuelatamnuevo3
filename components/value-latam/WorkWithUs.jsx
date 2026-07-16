import Link from 'next/link';
import { workFaqs, workFeatures } from '@/data/valueLatamContent';
import FeatureGrid from './FeatureGrid';
import SectionHeading from './SectionHeading';

export default function WorkWithUs() {
  return (
    <section
      className="finan"
      data-vl-gsap-root="referrals"
      data-vl-internal-page="referenciadores"
      id="trabaja"
    >
      <div className="wrap">
        <SectionHeading eyebrow="Trabajá con nosotros" title="Sumate a la consultora N°1 del mercado" />
        <p className="fin-lede">
          Integrá financiamiento, inversión, pagos e IA a tu propuesta. Vos aportás la relación con el cliente;
          nosotros, la estrategia, la ejecución y el respaldo regulatorio.
        </p>

        <div className="join-section-sub">
          <span className="join-sub-eyebrow">Cómo sumarte</span>
          <h3 className="join-h3">Referí operaciones y gestioná tu cartera</h3>
          <p className="fin-lede" style={{ margin: '10px 0 0' }}>
            ¿Sos asesor, contador o consultor? Sumate como referenciador bajo nuestra estructura CNV y ofrecé
            soluciones integrales sin montar una operación propia.
          </p>
        </div>

        <FeatureGrid items={workFeatures} className="fin-grid" />

        <div className="join-section-sub">
          <span className="join-sub-eyebrow">La experiencia Value Latam</span>
          <h3 className="join-h3">Por qué trabajar con nosotros</h3>
          <div className="join-cards">
            <div className="jcard">
              <h4>Por qué Value Latam</h4>
              <p>
                Trabajá sobre operaciones reales en financiamiento, inversión, pagos e IA, con ejecución de punta a
                punta.
              </p>
            </div>
            <div className="jcard" data-vl-gsap-tilt="">
              <h4>Nuestra cultura</h4>
              <p>Confianza, autonomía, colaboración y mejora continua para construir relaciones duraderas.</p>
            </div>
            <div className="jcard">
              <h4>Nuestras oficinas</h4>
              <p>Un espacio flexible en Canning, pensado para colaborar y enfocarse en resultados.</p>
            </div>
          </div>
        </div>

        <div className="join-section-sub">
          <span className="join-sub-eyebrow">Preguntas frecuentes</span>
          <h3 className="join-h3">Lo que solés preguntarnos</h3>
          <div className="faq">
            {workFaqs.map(([summary, text]) => (
              <details key={summary}>
                <summary>{summary}</summary>
                <p>{text}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="fin-cta">
          <Link className="btn btn-primary" href="/#contacto">
            Ser referenciador
          </Link>
          <p className="note" style={{ marginTop: 14 }}>
            → Te contactamos para evaluar tu perfil y armar el esquema de trabajo
          </p>
        </div>
      </div>
    </section>
  );
}

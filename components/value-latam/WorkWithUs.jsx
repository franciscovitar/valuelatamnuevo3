import Link from 'next/link';
import { workFaqs, workFeatures } from '@/data/valueLatamContent';
import FeatureGrid from './FeatureGrid';
import SectionHeading from './SectionHeading';

export default function WorkWithUs() {
  return (
    <section className="finan" id="trabaja">
      <div className="wrap">
        <SectionHeading eyebrow="Trabajá con nosotros" title="Sumate a la consultora N°1 del mercado." />
        <p className="fin-lede reveal">Somos una consultoría financiera integral: no solo financiamiento, sino inversión y liquidez, medios de pago y automatización con IA. Combinamos experiencia senior en banca y mercado de capitales con una mirada de negocio, comprometidos con soluciones innovadoras y a medida de cada cliente. Nuestra misión es ayudar a las empresas y a sus dueños a crecer y alcanzar sus objetivos, con un servicio personalizado y ejecución de punta a punta.</p>
        <div className="join-section-sub reveal"><span className="join-sub-eyebrow">Cómo sumarte</span><h3 className="join-h3">Referí operaciones y gestioná tu propia cartera.</h3><p className="fin-lede" style={{ margin: '10px 0 0' }}>¿Sos asesor financiero, contador, consultor o tenés tu propia red de clientes? Asociate como referenciador y administrá tu cartera apoyado en nuestra estructura como Agente Productor ante la CNV. Vos ponés la relación; nosotros, la ejecución, la tecnología y el respaldo regulatorio.</p></div>
        <FeatureGrid items={workFeatures} className="fin-grid reveal" />
        <div className="join-section-sub reveal"><span className="join-sub-eyebrow">La experiencia Value Latam</span><h3 className="join-h3">Por qué trabajar con nosotros.</h3><div className="join-cards">
          <div className="jcard"><h4>Por qué Value Latam</h4><p>Sumarte es apostar a tu crecimiento profesional dentro de una consultoría que integra las cuatro áreas —financiamiento, inversión, pagos e IA— y ejecuta de punta a punta. Aprendés, crecés y trabajás sobre operaciones reales.</p></div>
          <div className="jcard"><h4>Nuestra cultura</h4><p>Impulsamos una cultura basada en la confianza, la autonomía y la mejora continua. La colaboración y la escucha activa son la base para construir relaciones sólidas con los clientes y dentro del equipo.</p></div>
          <div className="jcard"><h4>Nuestras oficinas</h4><p>Trabajamos desde nuestras oficinas en Canning (Mariano Castex 499, Piso 3), pensadas para la colaboración y el trabajo en equipo, con un esquema flexible y foco en resultados.</p></div>
        </div></div>
        <div className="join-section-sub reveal"><span className="join-sub-eyebrow">Preguntas frecuentes</span><h3 className="join-h3">Lo que solés preguntarnos.</h3><div className="faq">{workFaqs.map(([summary, text]) => <details key={summary}><summary>{summary}</summary><p>{text}</p></details>)}</div></div>
        <div className="fin-cta reveal"><Link className="btn btn-primary" href="/#contacto">Quiero ser referenciador</Link><p className="note" style={{ marginTop: 14 }}>→ Te contactamos para evaluar tu perfil y armar el esquema de trabajo</p></div>
      </div>
    </section>
  );
}

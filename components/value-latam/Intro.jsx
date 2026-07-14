import { introHome } from '@/data/valueLatamContent';

export default function Intro() {
  return (
    <section className="hero-title" id="intro">
      <div className="wrap ht-inner">
        <span className="eyebrow">{introHome.eyebrow}</span>
        <h1 className="serif">{introHome.title}</h1>
        <p className="lead">{introHome.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#contacto">
            Agendá tu diagnóstico
          </a>
          <a className="btn btn-ghost" href="#soluciones">
            Ver soluciones
          </a>
        </div>
        <span className="hero-badge">
          Agente Productor <b>CNV</b> · Mat. <b>2651</b> · Ley 26.831
        </span>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { solutions } from '@/data/valueLatamContent';

export default function Solutions() {
  return (
    <section
      className="solutions vl-section--light"
      data-vl-gsap-root="solutions"
      data-vl-home-section="solutions"
      id="soluciones"
    >
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Qué hacemos</span>
          <h2 className="serif">Cuatro unidades. Un solo socio</h2>
        </div>

        <div className="sol-grid">
          {solutions.map((item) => (
            <article className="sol-card" key={item.index}>
              <span className="idx">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {item.href.startsWith('/') ? (
                <Link className="arrow sol-ficha-link" href={item.href}>
                  Conocer más ↗
                </Link>
              ) : (
                <a className="arrow sol-ficha-link" href={item.href}>
                  Conocer más ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

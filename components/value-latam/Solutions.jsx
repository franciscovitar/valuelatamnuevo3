import Link from 'next/link';
import { solutions } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

export default function Solutions() {
  return (
    <section className="solutions" id="soluciones">
      <div className="wrap">
        <SectionHeading eyebrow="Qué hacemos" title="Cuatro unidades. Un solo socio." />
        <div className="sol-grid">
          {solutions.map((item) => (
            <article className="sol-card reveal tilt" key={item.index}>
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

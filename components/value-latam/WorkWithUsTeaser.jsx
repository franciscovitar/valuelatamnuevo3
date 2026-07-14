import Link from 'next/link';
import { solutionPages, workTeaser } from '@/data/valueLatamContent';

export default function WorkWithUsTeaser() {
  return (
    <section className="finan" data-vl-gsap-root="referrals" data-vl-home-section="referrals" id="trabaja">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Trabajá con nosotros</span>
          <h2 className="serif">{workTeaser.title}</h2>
        </div>
        <p className="fin-lede">{workTeaser.body}</p>
        <div className="fin-cta">
          <Link className="btn btn-primary" href={solutionPages.referenciadores.path}>
            {workTeaser.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

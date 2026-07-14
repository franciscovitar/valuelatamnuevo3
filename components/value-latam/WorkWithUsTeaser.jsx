import Link from 'next/link';
import { solutionPages, workTeaser } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

export default function WorkWithUsTeaser() {
  return (
    <section className="finan" id="trabaja">
      <div className="wrap">
        <SectionHeading eyebrow="Trabajá con nosotros" title={workTeaser.title} />
        <p className="fin-lede reveal">{workTeaser.body}</p>
        <div className="fin-cta reveal">
          <Link className="btn btn-primary" href={solutionPages.referenciadores.path}>
            {workTeaser.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

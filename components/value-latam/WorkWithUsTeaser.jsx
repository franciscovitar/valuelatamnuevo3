import Link from 'next/link';
import { solutionPages, workTeaser } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

export default function WorkWithUsTeaser() {
  return (
    <section className="finan" data-vl-gsap-root="referrals" data-vl-home-section="referrals" id="trabaja">
      <div className="wrap">
        <SectionHeading
          eyebrow="Trabajá con nosotros"
          title={workTeaser.title}
        />
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

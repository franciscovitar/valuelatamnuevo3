import Link from 'next/link';
import { introHome } from '@/data/valueLatamContent';
import { HERO_CARDS } from './runtime/heroKeyframes';

export default function CoverStory() {
  return (
    <section
      className="cover cover-hero"
      id="top"
      aria-label="Presentación de Value Latam"
      data-vl-cover-root
    >
      <div className="cover-scroll" id="coverScroll">
        <div className="cover-sticky cover-hero__pin" id="coverSticky">
          <div className="cover-hero__stage" id="coverStage">
            <div className="cover-hero__base" aria-hidden="true" />

            <div className="cover-hero__lines" id="coverLines" aria-hidden="true">
              <span className="cover-hero__line" data-cover-line />
              <span className="cover-hero__line" data-cover-line />
              <span className="cover-hero__line" data-cover-line />
              <span className="cover-hero__line" data-cover-line />
            </div>

            <div className="cover-hero__radial" id="coverRadial" aria-hidden="true" />

            <div className="cover-hero__cards" id="coverCards" aria-hidden="true">
              {HERO_CARDS.map((card) => (
                <article className="cover-hero__card" key={card.id} data-cover-card>
                  <div className="cover-hero__card-icon">
                    <img src={card.icon} alt="" width={24} height={24} decoding="async" draggable={false} />
                  </div>
                  <div className="cover-hero__card-body">
                    <span className="cover-hero__card-index">{card.id}</span>
                    <p className="cover-hero__card-title">{card.title}</p>
                    <p className="cover-hero__card-desc">{card.desc}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="cover-hero__smoke" id="coverSmoke" aria-hidden="true">
              <img src="/hero-smoke.png" alt="" decoding="async" draggable={false} />
            </div>

            <div className="cover-hero__content-rail" id="coverContentRail">
              <div className="cover-hero__content" id="coverContent">
                <span className="cover-hero__eyebrow" id="coverEyebrow">
                  {introHome.eyebrow}
                </span>
                <h1 className="cover-hero__title" id="coverTitle">
                  <span className="cover-hero__title-line" id="coverTitleLine1">
                    El centro financiero
                  </span>
                  <span className="cover-hero__title-line cover-hero__title-line--accent" id="coverTitleLine2">
                    de tu empresa.
                  </span>
                </h1>
                <p className="cover-hero__lead" id="coverLead">
                  {introHome.lead}
                </p>
                <div className="cover-hero__actions" id="coverActions">
                  <Link className="btn btn-primary" href="#contacto">
                    Agendá tu diagnóstico
                  </Link>
                  <Link className="btn btn-ghost" href="#soluciones">
                    Ver soluciones
                  </Link>
                </div>
                <span className="cover-hero__badge" id="coverBadge">
                  Agente Productor <b>CNV</b> · Mat. <b>2651</b> · Ley 26.831
                </span>
              </div>
            </div>

            <div className="cover-hero__exit" id="coverExit" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  HERO_CARDS,
  HERO_COPY,
  HERO_DESIGN,
} from './runtime/heroKeyframes';

export default function CoverStory() {
  return (
    <section
      className="cover-hero"
      id="top"
      aria-label="Soluciones financieras inteligentes"
      data-vl-cover-root
      data-hero-design-width={HERO_DESIGN.width}
      data-hero-design-height={HERO_DESIGN.height}
    >
      <div className="cover-hero__scroll" id="coverScroll">
        <div className="cover-hero__sticky" id="coverSticky">
          <div className="cover-hero__viewport" id="coverViewport">
            <div className="cover-hero__design-stage" id="coverDesignStage">
              <div className="cover-hero__base" aria-hidden="true" />

              <div className="cover-hero__radial" id="coverRadial" aria-hidden="true" />

              <div className="cover-hero__lines" aria-hidden="true">
                <span className="cover-hero__line" data-cover-line />
                <span className="cover-hero__line" data-cover-line />
                <span className="cover-hero__line" data-cover-line />
                <span className="cover-hero__line" data-cover-line />
              </div>

              <div className="cover-hero__cards" aria-hidden="true">
                {HERO_CARDS.map((card) => (
                  <article className="cover-hero__card" key={card.id} data-cover-card>
                    <div className="cover-hero__card-float" data-cover-card-float>
                      <div className="cover-hero__card-icon">
                        <span
                          className="cover-hero__card-glyph"
                          style={{ '--hero-icon': `url('${card.icon}')` }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="cover-hero__card-body">
                        <span className="cover-hero__card-index">{card.id}</span>
                        <p className="cover-hero__card-title">{card.title}</p>
                        <p className="cover-hero__card-desc">{card.desc}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cover-hero__copy-rail">
                <div className="cover-hero__content" id="coverContent">
                  <span className="cover-hero__eyebrow">{HERO_COPY.eyebrow}</span>
                  <h1 className="cover-hero__title">
                    <span className="cover-hero__title-line">{HERO_COPY.titleLines[0]}</span>
                    <span className="cover-hero__title-line">{HERO_COPY.titleLines[1]}</span>
                    <span className="cover-hero__title-line cover-hero__title-line--accent">
                      {HERO_COPY.titleLines[2]}
                    </span>
                  </h1>
                  <p className="cover-hero__lead">
                    <span className="cover-hero__lead-line">{HERO_COPY.paragraphLead}</span>
                    <span className="cover-hero__lead-closer">{HERO_COPY.paragraphCloser}</span>
                  </p>
                </div>
              </div>

              <div className="cover-hero__smoke" id="coverSmoke" aria-hidden="true">
                <img src="/hero-smoke.png" alt="" decoding="async" draggable={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

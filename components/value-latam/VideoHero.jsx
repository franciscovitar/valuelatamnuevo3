const HERO_CHAPTERS = [
  {
    index: '01',
    title: 'Financiamiento',
    description: 'Capital de trabajo e inversión',
  },
  {
    index: '02',
    title: 'Liquidez',
    description: 'Gestión eficiente de activos',
  },
  {
    index: '03',
    title: 'Medios de pago',
    description: 'Infraestructura de cobros y pagos',
  },
  {
    index: '04',
    title: 'Procesos con IA',
    description: 'Automatización financiera',
  },
];

export default function VideoHero() {
  return (
    <section
      id="top"
      className="video-hero"
      data-vl-video-hero-root
      aria-label="Finanzas que impulsan tu empresa"
    >
      <div className="video-hero__scroll" data-video-hero-scroll>
        <div className="video-hero__sticky" data-video-hero-sticky>
          <div className="video-hero__media">
            <picture
              className="video-hero__fallback"
              data-video-hero-fallback
            >
              <source media="(max-width: 767px)" srcSet="/hero-city-mobile.webp" />
              <img
                className="video-hero__fallback-image"
                data-video-hero-fallback-image
                src="/hero-city-desktop.webp"
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
            </picture>

            <canvas
              className="video-hero__canvas"
              data-video-hero-canvas
              aria-hidden="true"
            />
          </div>

          <div className="video-hero__overlay" aria-hidden="true" />
          <div className="video-hero__vignette" aria-hidden="true" />
          <div className="video-hero__floor" data-video-hero-floor aria-hidden="true" />
          <div className="video-hero__exit-fade" data-video-hero-exit-fade aria-hidden="true" />

          <div className="wrap video-hero__stage">
            <div className="video-hero__intro" data-video-hero-intro>
              <span className="video-hero__eyebrow" data-video-hero-eyebrow>
                La evolución de tu operación
              </span>
              <span className="video-hero__eyebrow-mark" aria-hidden="true" />
              <h1 className="video-hero__title" data-video-hero-title>
                Finanzas que impulsan
                <br />
                tu empresa.
              </h1>
              <p className="video-hero__lead" data-video-hero-lead>
                Financiamiento, liquidez, medios de pago e IA conectados en una sola estrategia.
              </p>
              <a className="video-hero__cta" data-video-hero-cta href="#soluciones">
                Conocer soluciones
              </a>
            </div>

            <div className="video-hero__chapters" data-video-hero-chapters aria-hidden="true">
              <p className="video-hero__chapters-kicker" data-video-hero-chapters-kicker>
                Cuatro soluciones. Una sola estrategia.
              </p>
              <div className="video-hero__chapters-stack">
                {HERO_CHAPTERS.map((chapter, index) => (
                  <article
                    className="video-hero__chapter"
                    data-video-hero-chapter={index}
                    key={chapter.index}
                  >
                    <span className="video-hero__chapter-index">{chapter.index}</span>
                    <h2 className="video-hero__chapter-title">{chapter.title}</h2>
                    <p className="video-hero__chapter-desc">{chapter.description}</p>
                    <span className="video-hero__chapter-line" aria-hidden="true" />
                  </article>
                ))}
              </div>
            </div>

            <div className="video-hero__brand" data-video-hero-brand aria-hidden="true">
              <img
                className="video-hero__brand-logo"
                data-video-hero-brand-logo
                src="/value-latam-logo.png"
                alt=""
                width={900}
                height={327}
                decoding="async"
                draggable={false}
              />
              <p className="video-hero__brand-closer" data-video-hero-brand-closer>
                Un solo socio para toda tu operación.
              </p>
            </div>
          </div>

          <div className="video-hero__scroll-hint" data-video-hero-scroll-hint aria-hidden="true">
            <span className="video-hero__scroll-hint-text">Deslizá para descubrir</span>
            <span className="video-hero__scroll-hint-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

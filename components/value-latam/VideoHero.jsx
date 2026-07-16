const HERO_SERVICES = [
  'Financiamiento',
  'Liquidez',
  'Medios de pago',
  'Procesos con IA',
];

export default function VideoHero() {
  return (
    <section
      id="top"
      className="video-hero"
      data-vl-video-hero-root
      aria-label="Soluciones financieras inteligentes"
    >
      <div className="video-hero__scroll" data-video-hero-scroll>
        <div className="video-hero__sticky" data-video-hero-sticky>
          <div className="video-hero__media">
            <video
              className="video-hero__video"
              data-video-hero-video
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src="/videohero.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="video-hero__base" aria-hidden="true" />
          <div className="video-hero__tint" aria-hidden="true" />
          <div className="video-hero__vignette" aria-hidden="true" />
          <div className="video-hero__ambient" aria-hidden="true" />
          <div className="video-hero__navy-fade" data-video-hero-navy-fade aria-hidden="true" />

          <div className="video-hero__intro" data-video-hero-intro>
            <span className="video-hero__eyebrow" data-video-hero-eyebrow>
              La evolución de tu operación
            </span>
            <h1 className="video-hero__title" data-video-hero-title>
              <span className="video-hero__title-line">Soluciones</span>
              <span className="video-hero__title-line">Financieras</span>
              <span className="video-hero__title-line video-hero__title-line--accent">Inteligentes</span>
            </h1>
            <p className="video-hero__lead" data-video-hero-lead>
              Potenciamos la liquidez y automatizamos los procesos financieros de tu empresa con una plataforma
              integrada.
            </p>
            <p className="video-hero__closer" data-video-hero-closer>
              Un solo socio para toda tu operación.
            </p>
            <a className="video-hero__cta" data-video-hero-cta href="#soluciones">
              Conocer soluciones
            </a>
          </div>

          <div
            className="video-hero__services"
            data-video-hero-services
            aria-hidden="true"
          >
            <p className="video-hero__services-tagline" data-video-hero-services-tagline>
              Cuatro soluciones. Una sola estrategia.
            </p>
            <ul className="video-hero__services-list" data-video-hero-services-list>
              {HERO_SERVICES.map((label, index) => (
                <li
                  className="video-hero__service-item"
                  data-video-hero-service={index}
                  key={label}
                >
                  {label}
                </li>
              ))}
            </ul>
            <span
              className="video-hero__service-line"
              data-video-hero-service-line
              aria-hidden="true"
            />
          </div>

          <div className="video-hero__wordmark" data-video-hero-wordmark aria-hidden="true">
            <div className="video-hero__wordmark-stack">
              <span className="video-hero__wordmark-outline" data-video-hero-wordmark-outline>
                VALUE
                <br />
                LATAM
              </span>
              <span className="video-hero__wordmark-fill" data-video-hero-wordmark-fill>
                VALUE
                <br />
                LATAM
              </span>
            </div>
            <p className="video-hero__wordmark-closer" data-video-hero-wordmark-closer>
              Un solo socio para toda tu operación.
            </p>
          </div>

          <div className="video-hero__scroll-hint" data-video-hero-scroll-hint aria-hidden="true">
            <span className="video-hero__scroll-hint-text">Deslizá para descubrir</span>
            <span className="video-hero__scroll-hint-line" />
          </div>

          <div className="video-hero__bottom-transition" data-video-hero-bottom-transition aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

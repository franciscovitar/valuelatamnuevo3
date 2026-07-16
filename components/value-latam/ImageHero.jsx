export default function ImageHero() {
  return (
    <section
      id="top"
      className="image-hero"
      data-vl-image-hero-root
      aria-label="Soluciones financieras inteligentes"
    >
      <div className="image-hero__scroll" data-image-hero-scroll>
        <div className="image-hero__stage" data-image-hero-stage>
          <picture className="image-hero__picture">
            <source media="(max-width: 767px)" srcSet="/hero-city-mobile.webp" />
            <img
              src="/hero-city-desktop.webp"
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              decoding="async"
              data-image-hero-media
            />
          </picture>

          <div className="image-hero__tint" aria-hidden="true" />
          <div className="image-hero__vignette" aria-hidden="true" />
          <div className="image-hero__ambient" data-image-hero-ambient aria-hidden="true" />
          <div className="image-hero__grid" aria-hidden="true" />

          <div className="image-hero__content wrap">
            <div className="image-hero__intro" data-image-hero-intro>
              <span className="image-hero__eyebrow" data-image-hero-eyebrow>
                La evolución de tu operación
              </span>
              <span className="image-hero__eyebrow-mark" aria-hidden="true" />
              <h1 className="image-hero__title" data-image-hero-title>
                Finanzas que impulsan
                <br />
                tu empresa.
              </h1>
              <p className="image-hero__lead" data-image-hero-lead>
                Financiamiento, liquidez, medios de pago e IA conectados en una sola estrategia.
              </p>
              <a className="image-hero__cta" data-image-hero-cta href="#soluciones">
                Conocer soluciones
              </a>
            </div>

            <div className="image-hero__identity" data-image-hero-identity aria-hidden="true">
              <img
                className="image-hero__identity-logo"
                data-image-hero-identity-logo
                src="/value-latam-logo.png"
                alt=""
                width={900}
                height={327}
                decoding="async"
                draggable={false}
              />
              <p className="image-hero__identity-closer" data-image-hero-identity-closer>
                Un solo socio para toda tu operación.
              </p>
            </div>
          </div>

          <div className="image-hero__transition" data-image-hero-transition aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

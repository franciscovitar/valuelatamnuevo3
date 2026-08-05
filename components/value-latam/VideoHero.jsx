import HeroWordCloudScene from './HeroWordCloudScene';

export default function VideoHero() {
  return (
    <section
      id="top"
      className="video-hero video-hero--logo-assembly"
      data-vl-video-hero-root
      aria-label="Finanzas que impulsan tu empresa"
    >
      <div
        className="video-hero__scroll"
        data-video-hero-scroll
      >
        <div
          className="video-hero__sticky"
          data-video-hero-sticky
        >
          <div
            className="video-hero__assembly-background"
            aria-hidden="true"
          />
          <div
            className="video-hero__overlay"
            aria-hidden="true"
          />
          <div
            className="video-hero__vignette"
            aria-hidden="true"
          />
          <div
            className="video-hero__floor"
            aria-hidden="true"
          />
          <div
            className="video-hero__exit-fade"
            data-video-hero-exit-fade
            aria-hidden="true"
          />

          <div className="wrap video-hero__stage">
            <div
              className="video-hero__intro"
              data-video-hero-intro
            >
              <span
                className="video-hero__eyebrow"
                data-video-hero-eyebrow
              >
                La evolución de tu operación
              </span>

              <span
                className="video-hero__eyebrow-mark"
                aria-hidden="true"
              />

              <h1
                className="video-hero__title"
                data-video-hero-title
              >
                Finanzas que impulsan
                <br />
                tu empresa
              </h1>

              <p
                className="video-hero__lead"
                data-video-hero-lead
              >
                Financiamiento, liquidez, medios de pago e IA
                conectados en una sola estrategia.
              </p>

              <a
                className="video-hero__cta"
                data-video-hero-cta
                href="#soluciones"
              >
                Conocer soluciones
              </a>
            </div>

            <HeroWordCloudScene />
          </div>

          <div
            className="video-hero__scroll-hint"
            data-video-hero-scroll-hint
            aria-hidden="true"
          >
            <span className="video-hero__scroll-hint-text">
              Deslizá para descubrir
            </span>
            <span className="video-hero__scroll-hint-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

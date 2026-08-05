import HeroWordCloudScene from './HeroWordCloudScene';

export default function VideoHero() {
  return (
    <section
      id="top"
      className="video-hero video-hero--logo-assembly video-hero--direct-assembly"
      data-vl-video-hero-root
      aria-label="Distintas capacidades. Una sola estrategia."
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
            <HeroWordCloudScene />
          </div>

          <div
            className="video-hero__scroll-hint"
            data-video-hero-scroll-hint
            aria-hidden="true"
          >
            <span className="video-hero__scroll-hint-text">
              Deslizá para integrar
            </span>
            <span className="video-hero__scroll-hint-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

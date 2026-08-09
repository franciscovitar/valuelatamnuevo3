import HeroWordCloudScene from './HeroWordCloudScene';

export default function VideoHero() {
  return (
    <section
      id="top"
      className="video-hero video-hero--word-orbit"
      data-vl-video-hero-root
      aria-labelledby="hero-word-scene-title"
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
            className="video-hero__orbit-background"
            aria-hidden="true"
          />
          <div
            className="video-hero__orbit-vignette"
            aria-hidden="true"
          />

          <HeroWordCloudScene />

          <div
            className="video-hero__scroll-hint"
            data-video-hero-scroll-hint
            aria-hidden="true"
          >
            <span className="video-hero__scroll-hint-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

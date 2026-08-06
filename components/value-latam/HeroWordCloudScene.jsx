import { HERO_WORDS } from './heroWordCloudConfig';
import ValueLatamMark from './ValueLatamMark';

function getWordStyle(word) {
  const mobile = word.mobile || {};
  const tablet = word.tablet || {};

  return {
    '--word-x': `${word.x}vw`,
    '--word-y': `${word.y}vh`,
    '--word-opacity': word.opacity,
    '--word-blur': `${word.blur}px`,
    '--word-rotation': `${word.rotation}deg`,
    '--word-tablet-x': `${tablet.x ?? word.x}vw`,
    '--word-tablet-y': `${tablet.y ?? word.y}vh`,
    '--word-mobile-x': `${mobile.x ?? word.x}vw`,
    '--word-mobile-y': `${mobile.y ?? word.y}vh`,
    '--float-x': `${word.floatX}px`,
    '--float-y': `${word.floatY}px`,
    '--float-rotate': `${word.floatRotate}deg`,
    '--float-duration': `${word.floatDuration}s`,
    '--float-delay': `${word.floatDelay}s`,
  };
}

export default function HeroWordCloudScene() {
  return (
    <div
      className="hero-word-scene"
      data-hero-word-scene
    >
      <div
        className="hero-word-scene__words"
        data-hero-word-layer
        aria-hidden="true"
      >
        {HERO_WORDS.map((word) => (
          <span
            className={[
              'hero-word-scene__word-shell',
              `is-size-${word.size}`,
              word.accent ? 'is-accent' : '',
              word.front ? 'is-front' : '',
              word.depth === 'far' ? 'is-far' : '',
              word.mobileHidden ? 'is-mobile-hidden' : '',
              word.tabletHidden ? 'is-tablet-hidden' : '',
            ].filter(Boolean).join(' ')}
            data-hero-word={word.id}
            style={getWordStyle(word)}
            key={word.id}
          >
            <span className="hero-word-scene__word-float">
              {word.label}
            </span>
          </span>
        ))}
      </div>

      <div
        className="hero-word-scene__mark-anchor"
        data-hero-mark-anchor
        aria-hidden="true"
      >
        <span
          className="hero-word-scene__halo"
          data-hero-word-halo
        />
        <ValueLatamMark />
      </div>

      <div
        className="hero-word-scene__copy"
        data-hero-word-copy
      >
        <h1 id="hero-word-scene-title">
          Distintas capacidades.
          <span>Una sola estrategia.</span>
        </h1>

        <p
          className="hero-word-scene__brand-name"
          data-hero-brand-name
        >
          Value Latam
        </p>
      </div>
    </div>
  );
}

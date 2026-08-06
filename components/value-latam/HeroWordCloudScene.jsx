import { HERO_SCENE, HERO_WORDS } from './heroWordCloudConfig';
import ValueLatamMark from './ValueLatamMark';

/*
 * Estado del primer frame, antes de que el runtime tome el control (y estado
 * definitivo si el JS no corre). Se proyecta la palabra a su profundidad
 * inicial con la misma formula que usa el runtime, para que el hero se vea
 * igual apenas pinta y no salte cuando arranca la animacion.
 */
function projectAtRest(word) {
  const k = HERO_SCENE.focal / word.z0;
  const blur = k >= 0.5 ? 0 : Math.min(2.2, (0.5 - k) * 6);

  return { k, blur };
}

function getWordStyle(word) {
  const mobile = word.mobile || {};
  const tablet = word.tablet || {};
  const { k, blur } = projectAtRest(word);

  return {
    '--word-x': `${(word.wx * k).toFixed(2)}vw`,
    '--word-y': `${(word.wy * k).toFixed(2)}vh`,
    '--word-scale': k.toFixed(4),
    '--word-opacity': word.opacity ?? 1,
    '--word-blur': `${blur.toFixed(2)}px`,
    '--word-rotation': `${word.rotation}deg`,
    '--word-tablet-x': `${((tablet.wx ?? word.wx) * k).toFixed(2)}vw`,
    '--word-tablet-y': `${((tablet.wy ?? word.wy) * k).toFixed(2)}vh`,
    '--word-mobile-x': `${((mobile.wx ?? word.wx) * k).toFixed(2)}vw`,
    '--word-mobile-y': `${((mobile.wy ?? word.wy) * k).toFixed(2)}vh`,
    '--float-x': `${word.floatX}px`,
    '--float-y': `${word.floatY}px`,
    '--float-rotate': `${word.floatRotate}deg`,
    '--float-duration': `${word.floatDuration}s`,
    '--float-delay': `${word.floatDelay}s`,
  };
}

export default function HeroWordCloudScene() {
  return (
    <div className="hero-word-scene" data-hero-word-scene>
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

      <div className="hero-word-scene__core">
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
          <h1 id="hero-word-scene-title" data-hero-title>Value Latam</h1>

          <p
            className="hero-word-scene__description"
            data-hero-subcopy
          >
            Financiamiento, liquidez, medios de pago e IA conectados bajo un mismo equipo.
          </p>
        </div>
      </div>
    </div>
  );
}

import { HERO_WORDS, resolveDepthVisual } from './heroWordCloudConfig';
import ValueLatamMark from './ValueLatamMark';

/*
 * Estado del primer frame, antes de que el runtime tome el control (y estado
 * definitivo si el JS no corre): cada palabra en su posicion de reposo, con la
 * escala y la presencia que le corresponden por profundidad. El movimiento
 * ambiental lo agrega el runtime, porque cada palabra tiene su propia
 * trayectoria y eso no se puede expresar con un keyframe compartido.
 */
function getWordStyle(word) {
  const mobile = word.mobile || {};
  const tablet = word.tablet || {};
  const { scale, opacity, blur, zIndex } = resolveDepthVisual(word.depth);

  return {
    '--word-x': `${word.x}vw`,
    '--word-y': `${word.y}vh`,
    '--word-scale': scale.toFixed(4),
    '--word-opacity': opacity.toFixed(3),
    '--word-blur': `${blur.toFixed(2)}px`,
    '--word-rotation': `${word.rotation}deg`,
    '--word-z': zIndex,
    '--word-tablet-x': `${tablet.x ?? word.x}vw`,
    '--word-tablet-y': `${tablet.y ?? word.y}vh`,
    '--word-mobile-x': `${mobile.x ?? word.x}vw`,
    '--word-mobile-y': `${mobile.y ?? word.y}vh`,
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
              word.far ? 'is-far' : '',
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

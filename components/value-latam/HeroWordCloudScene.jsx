import { resolveDepthVisual } from './heroWordCloudConfig';
import { getHeroSatellites, isHeroImageMode } from './heroSatellites';
import ValueLatamMark from './ValueLatamMark';

/*
 * Estado del primer frame, antes de que el runtime tome el control (y estado
 * definitivo si el JS no corre): cada satelite en su posicion de reposo, con la
 * escala y la presencia que le corresponden por profundidad. El movimiento
 * ambiental lo agrega el runtime, porque cada satelite tiene su propia
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
  const imageMode = isHeroImageMode();

  return (
    <div
      className={`hero-word-scene${imageMode ? ' is-image-mode' : ''}`}
      data-hero-word-scene
    >
      <div
        className="hero-word-scene__words"
        data-hero-word-layer
        aria-hidden="true"
      >
        {getHeroSatellites().map((satellite) => (
          <span
            className={[
              'hero-word-scene__word-shell',
              // El recuadro define su tamano por `tile`; la palabra, por `size`.
              imageMode
                ? `is-tile is-tile-${satellite.tile} is-ratio-${satellite.ratio}`
                : `is-size-${satellite.size}`,
              satellite.accent ? 'is-accent' : '',
              satellite.far ? 'is-far' : '',
              satellite.mobileHidden ? 'is-mobile-hidden' : '',
              satellite.tabletHidden ? 'is-tablet-hidden' : '',
            ].filter(Boolean).join(' ')}
            data-hero-word={satellite.id}
            style={getWordStyle(satellite)}
            key={satellite.id}
          >
            {imageMode ? (
              <span className="hero-word-scene__tile">
                <img
                  alt={satellite.alt}
                  decoding="async"
                  loading="lazy"
                  src={satellite.src}
                />
              </span>
            ) : (
              <span className="hero-word-scene__word-float">
                {satellite.label}
              </span>
            )}
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
            Financiamiento, liquidez, medios de pago e IA conectados
            {' '}
            <span className="hero-word-scene__accent">bajo un mismo equipo</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

import { HERO_WORDS } from './heroWordCloudConfig';
import ValueLatamMark from './ValueLatamMark';

export default function HeroWordCloudScene() {
  return (
    <div
      className="hero-word-scene"
      data-hero-word-scene
      aria-labelledby="hero-word-scene-title"
    >
      <div
        className="hero-word-scene__words"
        aria-hidden="true"
      >
        {HERO_WORDS.map((word) => (
          <span
            className={
              `hero-word-scene__word${word.accent ? ' is-accent' : ''}`
            }
            data-hero-word={word.id}
            key={word.id}
          >
            {word.label}
          </span>
        ))}
      </div>

      <div
        className="hero-word-scene__center"
        data-hero-word-center
      >
        <span
          className="hero-word-scene__halo"
          data-hero-word-halo
          aria-hidden="true"
        />

        <ValueLatamMark />

        <span className="hero-word-scene__eyebrow">
          Una estructura integrada
        </span>

        <h1 id="hero-word-scene-title">
          Distintas capacidades.
          <span> Una sola estrategia.</span>
        </h1>

        <p>
          Financiamiento, liquidez, medios de pago e IA
          conectados bajo un mismo equipo.
        </p>
      </div>
    </div>
  );
}

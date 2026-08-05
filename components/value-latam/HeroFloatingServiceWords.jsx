const FLOATING_WORDS = [
  {
    label: 'Financiamiento',
    x: -36,
    y: -23,
    scale: 1.04,
    opacity: 0.72,
    blur: 0,
  },
  {
    label: 'Inversiones',
    x: 30,
    y: -26,
    scale: 0.78,
    opacity: 0.4,
    blur: 2,
  },
  {
    label: 'Liquidez',
    x: -42,
    y: 2,
    scale: 0.7,
    opacity: 0.3,
    blur: 3,
  },
  {
    label: 'Medios de pago',
    x: 35,
    y: 13,
    scale: 0.96,
    opacity: 0.58,
    blur: 0.5,
  },
  {
    label: 'Procesos con IA',
    x: -24,
    y: 27,
    scale: 0.82,
    opacity: 0.44,
    blur: 1.5,
  },
  {
    label: 'Mercado de capitales',
    x: 21,
    y: 30,
    scale: 0.64,
    opacity: 0.26,
    blur: 4,
  },
  {
    label: 'Estrategia',
    x: 42,
    y: -6,
    scale: 0.58,
    opacity: 0.22,
    blur: 5,
  },
  {
    label: 'Ejecución',
    x: -8,
    y: -33,
    scale: 0.56,
    opacity: 0.2,
    blur: 5.5,
  },
  {
    label: 'Resultados',
    x: 7,
    y: 5,
    scale: 1.12,
    opacity: 0.66,
    blur: 0,
  },
  {
    label: 'Respaldo',
    x: -35,
    y: 18,
    scale: 0.65,
    opacity: 0.25,
    blur: 3.5,
  },
  {
    label: 'Crecimiento',
    x: 37,
    y: 27,
    scale: 0.7,
    opacity: 0.3,
    blur: 3,
  },
  {
    label: 'Gestión integral',
    x: 4,
    y: -20,
    scale: 0.68,
    opacity: 0.32,
    blur: 2.5,
  },
];

const ACCENT_WORDS = new Set([
  'Financiamiento',
  'Medios de pago',
  'Resultados',
]);

export default function HeroFloatingServiceWords() {
  return (
    <div
      className="video-hero__word-cloud"
      data-video-hero-word-cloud
      aria-label="Servicios integrados de Value Latam"
    >
      <div
        className="video-hero__word-cloud-words"
        aria-hidden="true"
      >
        {FLOATING_WORDS.map((word) => (
          <span
            className={
              `video-hero__floating-word ${
                ACCENT_WORDS.has(word.label)
                  ? 'is-accent'
                  : ''
              }`
            }
            data-video-hero-word
            data-word-x={word.x}
            data-word-y={word.y}
            data-word-scale={word.scale}
            data-word-opacity={word.opacity}
            data-word-blur={word.blur}
            key={word.label}
          >
            {word.label}
          </span>
        ))}
      </div>

      <div
        className="video-hero__word-cloud-message"
        data-video-hero-word-message
      >
        <span
          className="video-hero__word-cloud-eyebrow"
          data-video-hero-word-eyebrow
        >
          Cuatro soluciones. Una sola estrategia.
        </span>

        <h2 data-video-hero-word-title>
          Todo lo que tu empresa necesita para
          <span> financiarse, operar y crecer.</span>
        </h2>

        <p data-video-hero-word-copy>
          Financiamiento, inversión, medios de pago e IA
          conectados bajo un mismo equipo.
        </p>
      </div>
    </div>
  );
}

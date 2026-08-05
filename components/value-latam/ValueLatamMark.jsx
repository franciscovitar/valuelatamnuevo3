export default function ValueLatamMark() {
  return (
    <svg
      className="hero-word-scene__mark"
      data-hero-word-mark
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="vl-mark-cream" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#e8e2d7" />
        </linearGradient>
        <linearGradient id="vl-mark-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2c994" />
          <stop offset="1" stopColor="#b99455" />
        </linearGradient>
        <pattern
          id="vl-mark-scan-pattern"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <rect width="3" height="1" fill="rgba(255,255,255,.86)" />
          <rect y="1" width="3" height="2" fill="rgba(255,255,255,.10)" />
        </pattern>
        <clipPath id="vl-mark-cream-shape">
          <path d="M15 36h13l7-16h14L38 44H25l-7 12H7l8-20Z" />
        </clipPath>
        <clipPath id="vl-mark-gold-shape">
          <path d="M35 20h14l-8 17H29l6-17Z" />
        </clipPath>
      </defs>

      <g className="hero-word-scene__mark-outline" data-hero-mark-outline>
        <path d="M15 36h13l7-16h14L38 44H25l-7 12H7l8-20Z" />
        <path d="M35 20h14l-8 17H29l6-17Z" />
      </g>

      <g clipPath="url(#vl-mark-cream-shape)">
        <rect
          data-hero-mark-fill="cream-top"
          x="0"
          y="0"
          width="64"
          height="36"
          fill="url(#vl-mark-cream)"
        />
        <rect
          data-hero-mark-fill="cream-bottom"
          x="0"
          y="32"
          width="64"
          height="32"
          fill="url(#vl-mark-cream)"
        />
        <rect
          data-hero-mark-scan="cream-top"
          x="-12"
          y="0"
          width="10"
          height="37"
          fill="url(#vl-mark-scan-pattern)"
        />
        <rect
          data-hero-mark-scan="cream-bottom"
          x="66"
          y="31"
          width="10"
          height="33"
          fill="url(#vl-mark-scan-pattern)"
        />
      </g>

      <g clipPath="url(#vl-mark-gold-shape)">
        <rect
          data-hero-mark-fill="gold-top"
          x="0"
          y="0"
          width="64"
          height="29"
          fill="url(#vl-mark-gold)"
        />
        <rect
          data-hero-mark-fill="gold-bottom"
          x="0"
          y="28"
          width="64"
          height="36"
          fill="url(#vl-mark-gold)"
        />
        <rect
          data-hero-mark-scan="gold-top"
          x="0"
          y="-10"
          width="64"
          height="8"
          fill="url(#vl-mark-scan-pattern)"
        />
        <rect
          data-hero-mark-scan="gold-bottom"
          x="0"
          y="70"
          width="64"
          height="8"
          fill="url(#vl-mark-scan-pattern)"
        />
      </g>
    </svg>
  );
}

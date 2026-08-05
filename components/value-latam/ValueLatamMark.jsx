export default function ValueLatamMark() {
  return (
    <svg
      className="hero-word-scene__mark"
      data-hero-word-mark
      viewBox="0 0 64 64"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="vl-orbit-cream"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#e8e2d7" />
        </linearGradient>

        <linearGradient
          id="vl-orbit-gold"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0" stopColor="#e4cc98" />
          <stop offset="1" stopColor="#b99455" />
        </linearGradient>

        <pattern
          id="vl-orbit-scan"
          width="2.4"
          height="2.4"
          patternUnits="userSpaceOnUse"
        >
          <rect
            width="2.4"
            height="0.72"
            fill="rgba(255,255,255,.92)"
          />
          <rect
            y="0.72"
            width="2.4"
            height="1.68"
            fill="rgba(255,255,255,.08)"
          />
        </pattern>

        <clipPath id="vl-orbit-cream-shape">
          <path d="M15 36h13l7-16h14L38 44H25l-7 12H7l8-20Z" />
        </clipPath>

        <clipPath id="vl-orbit-gold-shape">
          <path d="M35 20h14l-8 17H29l6-17Z" />
        </clipPath>
      </defs>

      <g
        className="hero-word-scene__mark-outline"
        data-hero-mark-outline
      >
        <path d="M15 36h13l7-16h14L38 44H25l-7 12H7l8-20Z" />
        <path d="M35 20h14l-8 17H29l6-17Z" />
      </g>

      <g clipPath="url(#vl-orbit-cream-shape)">
        <rect
          data-hero-mark-fill="cream-a"
          x="-2"
          y="0"
          width="68"
          height="35"
          fill="url(#vl-orbit-cream)"
        />
        <rect
          data-hero-mark-fill="cream-b"
          x="-2"
          y="31"
          width="68"
          height="35"
          fill="url(#vl-orbit-cream)"
        />
        <rect
          data-hero-mark-scan="cream-a"
          x="-12"
          y="0"
          width="8"
          height="36"
          fill="url(#vl-orbit-scan)"
        />
        <rect
          data-hero-mark-scan="cream-b"
          x="68"
          y="30"
          width="8"
          height="36"
          fill="url(#vl-orbit-scan)"
        />
      </g>

      <g clipPath="url(#vl-orbit-gold-shape)">
        <rect
          data-hero-mark-fill="gold-a"
          x="0"
          y="-2"
          width="64"
          height="31"
          fill="url(#vl-orbit-gold)"
        />
        <rect
          data-hero-mark-fill="gold-b"
          x="0"
          y="26"
          width="64"
          height="40"
          fill="url(#vl-orbit-gold)"
        />
        <rect
          data-hero-mark-scan="gold-a"
          x="0"
          y="-10"
          width="64"
          height="7"
          fill="url(#vl-orbit-scan)"
        />
        <rect
          data-hero-mark-scan="gold-b"
          x="0"
          y="69"
          width="64"
          height="7"
          fill="url(#vl-orbit-scan)"
        />
      </g>
    </svg>
  );
}

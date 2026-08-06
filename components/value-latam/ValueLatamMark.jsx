const SMALL_BAR = 'M41 38L47 49H59L53 38H41Z';
const MIDDLE_BAR = 'M81 38H69L55 63L67 62L81 38Z';
const TALL_BAR = 'M103 25H91L70 62L81 63L103 25Z';

export default function ValueLatamMark() {
  return (
    <svg
      className="hero-word-scene__mark"
      data-hero-word-mark
      viewBox="36 20 72 48"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="vl-mark-small-clip">
          <path d={SMALL_BAR} />
        </clipPath>
        <clipPath id="vl-mark-middle-clip">
          <path d={MIDDLE_BAR} />
        </clipPath>
        <clipPath id="vl-mark-tall-clip">
          <path d={TALL_BAR} />
        </clipPath>
        <pattern
          id="vl-mark-scan-pattern"
          width="2.2"
          height="2.2"
          patternUnits="userSpaceOnUse"
        >
          <rect width="2.2" height="0.7" fill="rgba(255,255,255,.92)" />
          <rect y="0.7" width="2.2" height="1.5" fill="rgba(255,255,255,.10)" />
        </pattern>
      </defs>

      <g
        className="hero-word-scene__mark-outline"
        data-hero-mark-outline
      >
        <path d={SMALL_BAR} />
        <path d={MIDDLE_BAR} />
        <path d={TALL_BAR} />
      </g>

      <g clipPath="url(#vl-mark-small-clip)">
        <rect
          data-hero-mark-fill="small"
          x="36"
          y="20"
          width="72"
          height="48"
          fill="#f7f4ed"
        />
        <rect
          data-hero-mark-scan="small"
          x="34"
          y="20"
          width="7"
          height="48"
          fill="url(#vl-mark-scan-pattern)"
        />
      </g>

      <g clipPath="url(#vl-mark-middle-clip)">
        <rect
          data-hero-mark-fill="middle"
          x="36"
          y="20"
          width="72"
          height="48"
          fill="#f7f4ed"
        />
        <rect
          data-hero-mark-scan="middle"
          x="36"
          y="68"
          width="72"
          height="7"
          fill="url(#vl-mark-scan-pattern)"
        />
      </g>

      <g clipPath="url(#vl-mark-tall-clip)">
        <rect
          data-hero-mark-fill="tall"
          x="36"
          y="20"
          width="72"
          height="48"
          fill="#f7f4ed"
        />
        <rect
          data-hero-mark-scan="tall"
          x="36"
          y="13"
          width="72"
          height="7"
          fill="url(#vl-mark-scan-pattern)"
        />
      </g>
    </svg>
  );
}

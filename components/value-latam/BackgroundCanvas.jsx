export default function BackgroundCanvas() {
  return (
    <svg
      className="vl-bg-lines"
      id="vl-bg-lines"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="vl-bg-line-fade-y" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="12%" stopColor="white" stopOpacity="1" />
          <stop offset="88%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="vl-bg-lines-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="900">
          <rect width="1440" height="900" fill="url(#vl-bg-line-fade-y)" />
        </mask>
      </defs>

      <g className="vl-bg-lines__draw" mask="url(#vl-bg-lines-mask)">
        {/* Left brass — principal */}
        <path
          className="vl-bg-lines__path vl-bg-lines__path--brass"
          data-vl-bg-line="1"
          fill="none"
          d="M-40 70 C 95 160, 70 310, 40 430 C 8 560, 130 680, 90 820 C 60 910, 160 980, 210 1040"
        />
        {/* Right steel blue — principal */}
        <path
          className="vl-bg-lines__path vl-bg-lines__path--azure"
          data-vl-bg-line="2"
          fill="none"
          d="M1480 40 C 1330 130, 1390 290, 1285 420 C 1180 560, 1410 670, 1320 800 C 1250 900, 1380 970, 1300 1060"
        />
        {/* Left secondary — tenue */}
        <path
          className="vl-bg-lines__path vl-bg-lines__path--soft vl-bg-lines__path--desktop"
          data-vl-bg-line="3"
          fill="none"
          d="M 30 -30 C 170 90, 55 250, 145 400 C 240 560, 70 700, 155 860 C 200 940, 110 1010, 180 1100"
        />
        {/* Right secondary — tenue */}
        <path
          className="vl-bg-lines__path vl-bg-lines__path--soft-brass vl-bg-lines__path--desktop"
          data-vl-bg-line="4"
          fill="none"
          d="M 1410 180 C 1270 290, 1365 430, 1220 540 C 1100 640, 1340 760, 1245 900 C 1190 980, 1310 1040, 1260 1120"
        />
      </g>
    </svg>
  );
}

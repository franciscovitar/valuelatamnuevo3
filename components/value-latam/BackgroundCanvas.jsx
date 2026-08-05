export default function BackgroundCanvas() {
  const lineKeys = ['outer', 'middle', 'inner'];

  return (
    <div
      className="vl-bg-lines-layer"
      data-vl-bg-lines-root
      aria-hidden="true"
    >
      <svg
        className="vl-bg-lines"
        data-vl-bg-lines-svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          {lineKeys.map((lineKey) => (
            <linearGradient
              id={`vl-history-gradient-${lineKey}`}
              data-vl-history-gradient={lineKey}
              gradientUnits="userSpaceOnUse"
              key={`history-${lineKey}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopOpacity="0" />
              <stop offset="18%" stopOpacity="0.12" />
              <stop offset="58%" stopOpacity="0.46" />
              <stop offset="100%" stopOpacity="0.72" />
            </linearGradient>
          ))}

          {lineKeys.map((lineKey) => (
            <linearGradient
              id={`vl-active-gradient-${lineKey}`}
              data-vl-active-gradient={lineKey}
              gradientUnits="userSpaceOnUse"
              key={`active-${lineKey}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopOpacity="0.04" />
              <stop offset="34%" stopOpacity="0.28" />
              <stop offset="70%" stopOpacity="0.78" />
              <stop offset="100%" stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>

        <g
          className="vl-bg-lines__world"
          data-vl-bg-lines-world
        >
          {lineKeys.map((lineKey) => (
            <g
              key={lineKey}
              data-vl-line-group={lineKey}
              className={
                `vl-bg-lines__line-group `
                + `vl-bg-lines__line-group--${lineKey}`
              }
            >
              <path
                data-vl-history-trail={lineKey}
                className={
                  `vl-bg-lines__path `
                  + `vl-bg-lines__path--history `
                  + `vl-bg-lines__path--${lineKey}`
                }
              />
              <path
                data-vl-active-trail={lineKey}
                className={
                  `vl-bg-lines__path `
                  + `vl-bg-lines__path--active `
                  + `vl-bg-lines__path--${lineKey}`
                }
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function BackgroundCanvas() {
  const lineKeys = ['outer', 'middle', 'inner'];
  const nodeCount = 5;
  const sparkCount = 6;

  return (
    <div
      className="vl-bg-lines-layer"
      data-vl-bg-lines-root
      aria-hidden="true"
    >
      <svg
        className="vl-bg-lines"
        data-vl-bg-lines-svg
        viewBox="0 0 1000 1"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="vl-network-spark-glow"
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur
              stdDeviation="2.6"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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

          <g
            className="vl-bg-lines__nodes"
            data-vl-network-nodes
          >
            {Array.from({ length: nodeCount }, (_, index) => (
              <circle
                key={`node-${index}`}
                data-vl-network-node={index}
                className="vl-bg-lines__network-node"
              />
            ))}
          </g>

          <g
            className="vl-bg-lines__spark"
            data-vl-network-spark
            filter="url(#vl-network-spark-glow)"
          >
            <circle
              data-vl-spark-halo
              className="vl-bg-lines__spark-halo"
            />
            {Array.from({ length: sparkCount }, (_, index) => (
              <path
                key={`spark-${index}`}
                data-vl-spark-bolt={index}
                className="vl-bg-lines__spark-bolt"
              />
            ))}
          </g>

          <circle
            data-vl-travel-head
            className="vl-bg-lines__travel-head"
          />
        </g>
      </svg>
    </div>
  );
}

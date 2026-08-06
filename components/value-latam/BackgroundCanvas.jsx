const LINE_KEYS = ['outer', 'middle', 'inner'];
const SPARK_COUNT = 6;

export default function BackgroundCanvas() {
  return (
    <div
      className="vl-bg-lines-layer"
      data-vl-bg-lines-root
      aria-hidden="true"
    >
      <svg
        className="vl-bg-lines"
        data-vl-bg-lines-svg
        role="presentation"
        focusable="false"
      >
        <g
          className="vl-bg-lines__world"
          data-vl-bg-lines-world
        >
          {LINE_KEYS.map((lineKey) => (
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
              <circle
                data-vl-travel-head={lineKey}
                className={
                  `vl-bg-lines__travel-head `
                  + `vl-bg-lines__travel-head--${lineKey}`
                }
              />
            </g>
          ))}

          <g
            className="vl-bg-lines__spark"
            data-vl-spark-root
          >
            <circle
              data-vl-spark-halo
              className="vl-bg-lines__spark-halo"
            />

            {Array.from({ length: SPARK_COUNT }, (_, index) => (
              <g
                key={`spark-${index}`}
                data-vl-spark-bolt={index}
                className="vl-bg-lines__spark-bolt"
              >
                <path
                  data-vl-spark-glow
                  className="vl-bg-lines__spark-glow"
                />
                <path
                  data-vl-spark-core
                  className="vl-bg-lines__spark-core"
                />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

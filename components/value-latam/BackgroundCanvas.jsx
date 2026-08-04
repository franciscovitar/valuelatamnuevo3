export default function BackgroundCanvas() {
  const lineKeys = ['outer', 'middle', 'inner'];

  return (
    <div className="vl-bg-lines-layer" data-vl-bg-lines-root aria-hidden="true">
      <svg className="vl-bg-lines" data-vl-bg-lines-svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <g className="vl-bg-lines__world is-floating" data-vl-bg-lines-world>
          <g className="vl-bg-lines__shared-float" data-vl-bg-lines-shared-float>
            {lineKeys.map((lineKey) => (
              <g
                key={lineKey}
                data-vl-line-group={lineKey}
                className={`vl-bg-lines__line-group vl-bg-lines__line-group--${lineKey}`}
              >
                <path data-vl-history-trail={lineKey} className={`vl-bg-lines__path vl-bg-lines__path--history vl-bg-lines__path--${lineKey}`} />
                <path data-vl-active-trail={lineKey} className={`vl-bg-lines__path vl-bg-lines__path--active vl-bg-lines__path--${lineKey}`} />

                <g data-vl-node={lineKey} className="vl-bg-lines__node">
                  <ellipse data-vl-node-halo={lineKey} className="vl-bg-lines__node-halo" />
                  <ellipse data-vl-node-core={lineKey} className="vl-bg-lines__node-core" />
                </g>
              </g>
            ))}

            <g data-vl-shared-node className="vl-bg-lines__shared-node">
              <ellipse data-vl-shared-node-halo className="vl-bg-lines__node-halo" />
              <ellipse data-vl-shared-node-core className="vl-bg-lines__node-core" />
            </g>

            <g data-vl-lines-debug-overlay className="vl-bg-lines__debug-overlay" opacity="0" />
          </g>
        </g>
      </svg>
    </div>
  );
}

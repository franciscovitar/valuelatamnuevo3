export default function BackgroundCanvas() {
  return (
    <div className="vl-bg-lines-layer" id="vl-bg-lines-layer" aria-hidden="true">
      <svg
        className="vl-bg-lines"
        id="vl-bg-lines"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <g className="vl-bg-lines__paths">
          <path
            className="vl-bg-lines__path vl-bg-lines__path--primary"
            data-vl-bg-line="primary"
            fill="none"
          />
          <path
            className="vl-bg-lines__path vl-bg-lines__path--secondary"
            data-vl-bg-line="secondary"
            fill="none"
          />
          <path
            className="vl-bg-lines__path vl-bg-lines__path--brass"
            data-vl-bg-line="brass"
            fill="none"
          />
        </g>
        <g className="vl-bg-lines__tips">
          <circle
            className="vl-bg-lines__tip vl-bg-lines__tip--primary"
            data-vl-bg-tip="primary"
            r="2"
          />
          <circle
            className="vl-bg-lines__tip vl-bg-lines__tip--secondary"
            data-vl-bg-tip="secondary"
            r="1.8"
          />
          <circle
            className="vl-bg-lines__tip vl-bg-lines__tip--brass"
            data-vl-bg-tip="brass"
            r="1.6"
          />
        </g>
      </svg>
    </div>
  );
}

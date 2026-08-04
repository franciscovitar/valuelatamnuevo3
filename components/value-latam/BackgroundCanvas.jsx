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
        <g className="vl-bg-line-scenes" data-vl-line-scenes />
      </svg>
    </div>
  );
}

import { metrics } from '@/data/valueLatamContent';

export default function Metrics() {
  return (
    <section
      className="metrics"
      data-vl-gsap-root="metrics"
      data-vl-home-section="metrics"
      id="metrics"
      style={{ paddingBottom: 64 }}
    >
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">Resultados</span>
          <h2 className="serif">Experiencia que se mide en estructuras cerradas.</h2>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <div className="metric" key={metric.caption}>
              <div className="num">
                {metric.prefix}
                <span className="cv" data-count={metric.value}>
                  {metric.value}
                </span>
                <small>{metric.suffix}</small>
              </div>
              <div className="cap">{metric.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

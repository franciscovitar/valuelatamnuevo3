export default function Regulation() {
  return (
    <section className="reg">
      <div className="wrap reg-inner reveal">
        <div>
          <span className="eyebrow">Mención regulatoria</span>
          <p style={{ marginTop: 18 }}>Value Latam presta servicios de consultoría financiera estratégica, análisis, estructuración de financiamiento y asesoramiento en alternativas de inversión.</p>
          <p>Las operaciones en el mercado de capitales son canalizadas a través de agentes autorizados y registrados ante la Comisión Nacional de Valores (CNV), conforme a la normativa vigente.</p>
          <p className="badge">Agente Productor CNV · Matrícula N° 2651 · Ley N° 26.831</p>
          <p>Value Latam no actúa como entidad financiera ni capta fondos del público, limitándose a la estructuración, asesoramiento y canalización de operaciones a través de intermediarios autorizados.</p>
        </div>
        <div className="reg-seal-panel" aria-label="Organismos regulatorios">
          <span className="reg-seal-kicker">Marco de referencia</span>
          <div className="seals">
            <a className="seal logo seal-logo--cnv" href="https://www.argentina.gob.ar/cnv" target="_blank" rel="noopener noreferrer" aria-label="Comisión Nacional de Valores">
              <img src="/logos/cnv-clean.png" alt="CNV" width={932} height={367} loading="lazy" decoding="async" />
              <span className="logo-fallback">CNV</span>
            </a>
            <a className="seal logo seal-logo--byma" href="https://www.byma.com.ar/" target="_blank" rel="noopener noreferrer" aria-label="BYMA">
              <img src="/logos/byma-clean.png" alt="BYMA" width={992} height={394} loading="lazy" decoding="async" />
              <span className="logo-fallback">BYMA</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

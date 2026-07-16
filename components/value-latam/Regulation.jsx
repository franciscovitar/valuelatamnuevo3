const regulatoryCopy = [
  {
    key: 'intro',
    className: '',
    style: { marginTop: 18 },
    text: 'Value Latam presta servicios de consultoría financiera estratégica, análisis, estructuración de financiamiento y asesoramiento en alternativas de inversión.',
  },
  {
    key: 'cnv',
    className: '',
    text: 'Las operaciones en el mercado de capitales son canalizadas a través de agentes autorizados y registrados ante la Comisión Nacional de Valores (CNV), conforme a la normativa vigente.',
  },
  {
    key: 'badge',
    className: 'badge',
    text: 'Agente Productor CNV · Matrícula N° 2651 · Ley N° 26.831',
  },
  {
    key: 'disclaimer',
    className: '',
    text: 'Value Latam no actúa como entidad financiera ni capta fondos del público, limitándose a la estructuración, asesoramiento y canalización de operaciones a través de intermediarios autorizados.',
  },
];

const regulatorySeals = [
  {
    key: 'cnv',
    href: 'https://www.argentina.gob.ar/cnv',
    label: 'Comisión Nacional de Valores',
    className: 'seal logo reg-seal-link seal-logo--cnv',
    src: '/logos/cnv-clean.png',
    alt: 'CNV',
    width: 932,
    height: 367,
    fallback: 'CNV',
  },
  {
    key: 'byma',
    href: 'https://www.byma.com.ar/',
    label: 'BYMA',
    className: 'seal logo reg-seal-link seal-logo--byma',
    src: '/logos/byma-clean.png',
    alt: 'BYMA',
    width: 992,
    height: 394,
    fallback: 'BYMA',
  },
];

export default function Regulation() {
  return (
    <section className="reg" data-vl-gsap-root="regulation" data-vl-home-section="regulation">
      <div className="wrap reg-inner">
        <div>
          <span className="eyebrow">Mención regulatoria</span>
          {regulatoryCopy.map((paragraph) => (
            <p className={paragraph.className} key={paragraph.key} style={paragraph.style}>
              {paragraph.text}
            </p>
          ))}
        </div>

        <div aria-label="Organismos regulatorios" className="reg-seal-panel">
          <span className="reg-seal-kicker">Marco de referencia</span>
          <div className="seals">
            {regulatorySeals.map((seal) => (
              <a
                aria-label={seal.label}
                className={seal.className}
                href={seal.href}
                key={seal.key}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt={seal.alt}
                  decoding="async"
                  height={seal.height}
                  loading="lazy"
                  src={seal.src}
                  width={seal.width}
                />
                <span className="logo-fallback">{seal.fallback}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

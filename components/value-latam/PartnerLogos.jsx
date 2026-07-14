const partnerLogos = [
  { src: '/logos/balanz-clean.png', alt: 'Balanz', slug: 'balanz', variant: 'badge' },
  { src: '/logos/argenpymes-dark.png', alt: 'Argenpymes', slug: 'argenpymes', variant: 'plain' },
  { src: '/logos/trend-dark.png', alt: 'Trend Capital', slug: 'trend', variant: 'plain' },
  { src: '/logos/acindar-dark.png', alt: 'Acindar Pymes', slug: 'acindar', variant: 'plain' },
  { src: '/logos/adcap-clean.png', alt: 'AdCap', slug: 'adcap', variant: 'badge' },
];

const carouselSets = [partnerLogos, partnerLogos];

function LogoItem({ logo, suffix = '' }) {
  return (
    <span className={`partner-logo partner-logo--${logo.slug} partner-logo--${logo.variant}`}>
      <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} loading="lazy" decoding="async" />
      <b className="rel-fb">{logo.alt}</b>
    </span>
  );
}

export default function PartnerLogos() {
  return (
    <section className="trust partner-logos" aria-label="Empresas y partners">
      <div className="wrap">
        <div className="sec-head reveal partner-head">
          <span className="eyebrow">Red de trabajo</span>
          <h2 className="serif">Empresas y aliados con los que trabajamos.</h2>
        </div>

        <div className="partner-logo-grid partner-logo-grid--static reveal">
          {partnerLogos.map((logo) => <LogoItem logo={logo} key={logo.alt} />)}
        </div>

        <div className="partner-carousel-shell reveal" aria-hidden="true">
          <div className="partner-carousel-viewport">
            <div className="partner-carousel-track">
              {carouselSets.map((set, setIndex) => (
                <div className="partner-carousel-set" key={`partner-set-${setIndex}`}>
                  {set.map((logo) => <LogoItem logo={logo} key={`${logo.alt}-${setIndex}`} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

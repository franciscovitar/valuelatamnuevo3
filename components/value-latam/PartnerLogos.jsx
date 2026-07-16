const partnerLogos = [
  { src: '/logos/balanz-clean.png', alt: 'Balanz', slug: 'balanz', variant: 'badge' },
  { src: '/logos/argenpymes-dark.png', alt: 'Argenpymes', slug: 'argenpymes', variant: 'plain' },
  { src: '/logos/trend-dark.png', alt: 'Trend Capital', slug: 'trend', variant: 'plain' },
  { src: '/logos/acindar-dark.png', alt: 'Acindar Pymes', slug: 'acindar', variant: 'plain' },
  { src: '/logos/adcap-clean.png', alt: 'AdCap', slug: 'adcap', variant: 'badge' },
];

const carouselSets = [partnerLogos, partnerLogos];

export default function PartnerLogos() {
  return (
    <section
      aria-label="Empresas y partners"
      className="trust partner-logos"
      data-vl-gsap-root="partners"
      data-vl-home-section="partners"
    >
      <div className="wrap">
        <div className="sec-head partner-head">
          <span className="eyebrow">Red de trabajo</span>
          <h2 className="serif">Empresas y aliados con los que trabajamos</h2>
        </div>

        <div className="partner-logo-grid partner-logo-grid--static">
          {partnerLogos.map((logo) => (
            <span
              className={`partner-logo partner-logo--${logo.slug} partner-logo--${logo.variant}`}
              key={logo.alt}
            >
              <img alt={logo.alt} decoding="async" loading="lazy" src={logo.src} />
              <b className="rel-fb">{logo.alt}</b>
            </span>
          ))}
        </div>

        <div aria-hidden="true" className="partner-carousel-shell">
          <div className="partner-carousel-viewport">
            <div className="partner-carousel-track">
              {carouselSets.map((set, setIndex) => (
                <div className="partner-carousel-set" key={`partner-set-${setIndex}`}>
                  {set.map((logo) => (
                    <span
                      className={`partner-logo partner-logo--${logo.slug} partner-logo--${logo.variant}`}
                      key={`${logo.alt}-${setIndex}`}
                    >
                      <img alt={logo.alt} decoding="async" loading="lazy" src={logo.src} />
                      <b className="rel-fb">{logo.alt}</b>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const partnerLogos = [
  { src: '/logos/balanz-clean.png', alt: 'Balanz', slug: 'balanz', variant: 'badge' },
  { src: '/logos/argenpymes-dark.png', alt: 'Argenpymes', slug: 'argenpymes', variant: 'plain' },
  { src: '/logos/trend-dark.png', alt: 'Trend Capital', slug: 'trend', variant: 'plain' },
  { src: '/logos/acindar-dark.png', alt: 'Acindar Pymes', slug: 'acindar', variant: 'plain' },
  { src: '/logos/adcap-clean.png', alt: 'AdCap', slug: 'adcap', variant: 'badge' },
];

/*
 * Tres juegos identicos: la cinta se desplaza exactamente uno (-33.333%) y
 * vuelve a empezar, con lo cual el corte es invisible. Con dos juegos no
 * alcanzaba — para que el salto no deje un hueco hacen falta N-1 juegos que
 * cubran el viewport, y un solo juego mide menos que una pantalla ancha. Las
 * copias son decorativas, asi que solo el primero se expone a lectores de
 * pantalla.
 */
const CAROUSEL_SETS = [
  { key: 'lead', hidden: false },
  { key: 'echo-1', hidden: true },
  { key: 'echo-2', hidden: true },
];

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

        <div className="partner-carousel-shell" data-vl-partner-carousel>
          <div className="partner-carousel-viewport">
            <div className="partner-carousel-track">
              {CAROUSEL_SETS.map((set) => (
                <ul
                  aria-hidden={set.hidden ? 'true' : undefined}
                  className="partner-carousel-set"
                  key={set.key}
                >
                  {partnerLogos.map((logo) => (
                    <li
                      className={`partner-logo partner-logo--${logo.slug} partner-logo--${logo.variant}`}
                      key={`${logo.alt}-${set.key}`}
                    >
                      <img alt={set.hidden ? '' : logo.alt} decoding="async" loading="lazy" src={logo.src} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

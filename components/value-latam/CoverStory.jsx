import Image from 'next/image';
import Link from 'next/link';
import { introHome } from '@/data/valueLatamContent';

const SYMBOL_PATHS = {
  ivory: 'M15 36h13l7-16h14L38 44H25l-7 12H7l8-20Z',
  gold: 'M35 20h14l-8 17H29l6-17Z',
};

export default function CoverStory() {
  return (
    <section
      className="cover cover-cinema"
      id="top"
      aria-label="Presentación de Value Latam"
      data-vl-cover-root
    >
      <div className="cover-scroll" id="coverScroll">
        <div className="cover-sticky cover-cinema__pin" id="coverSticky">
          <div className="cover-media" id="coverMedia" data-cover-media>
            <div className="cover-media__visual" id="coverMediaVisual" data-cover-visual>
              <Image
                src="/finanzas.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="cover-media__img"
              />
            </div>
          </div>

          <div className="cover-media__overlay" id="coverMediaOverlay" aria-hidden="true" />

          <div className="cover-exterior" id="coverExterior" aria-hidden="true" />

          <div className="cover-brand" id="coverBrand" aria-hidden="true">
            <svg className="cover-symbol" id="coverSymbol" viewBox="0 0 64 64" aria-hidden="true">
              <path
                className="cover-symbol__path cover-symbol__path--ivory"
                d={SYMBOL_PATHS.ivory}
              />
              <path
                className="cover-symbol__path cover-symbol__path--gold"
                d={SYMBOL_PATHS.gold}
              />
            </svg>
          </div>

          <div className="cover-logo-outline" id="coverLogoOutline" aria-hidden="true">
            <img
              src="/value-latam-logo.png"
              alt=""
              width={900}
              height={327}
              decoding="async"
            />
          </div>

          <div className="cover-logo-stage" id="coverLogoStage" aria-hidden="true">
            <div className="cover-logo-mask" id="coverLogoMask">
              <div
                className="cover-logo-mask__fill"
                id="coverLogoMaskFill"
                data-cover-visual
                aria-hidden="true"
              />
            </div>
            <img
              className="cover-logo-fallback"
              id="coverLogoFallback"
              src="/value-latam-logo.png"
              alt="Value Latam"
              width={900}
              height={327}
              decoding="async"
            />
          </div>

          <div className="cover-dissolve" id="coverDissolve" aria-hidden="true" />

          <div className="cover-content" id="coverContent">
            <span className="eyebrow cover-content__eyebrow" id="coverEyebrow">
              {introHome.eyebrow}
            </span>
            <h1 className="serif cover-content__title" id="coverTitle">
              {introHome.title}
            </h1>
            <p className="lead cover-content__lead" id="coverLead">
              {introHome.lead}
            </p>
            <div className="hero-actions cover-content__actions" id="coverActions">
              <Link className="btn btn-primary" href="#contacto">
                Agendá tu diagnóstico
              </Link>
              <Link className="btn btn-ghost" href="#soluciones">
                Ver soluciones
              </Link>
            </div>
            <span className="hero-badge cover-content__badge" id="coverBadge">
              Agente Productor <b>CNV</b> · Mat. <b>2651</b> · Ley 26.831
            </span>
            <span className="cover-scroll-hint" id="coverScrollHint" aria-hidden="true">
              Scroll
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

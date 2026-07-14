import Link from 'next/link';
import SectionHeading from './SectionHeading';

export default function Liquidity() {
  return (
    <section className="finan" id="liquidez">
      <div className="wrap">
        <SectionHeading eyebrow="Unidad 02 · Inversión & Liquidez" title="Dos negocios: la liquidez de tu empresa y el patrimonio de los socios." />

        <p className="fin-lede reveal">
          Somos especialistas en dos frentes distintos y complementarios. Por un lado, la gestión de liquidez de tu empresa. Por el otro, el portfolio manager del patrimonio de los socios. En ambos, diseñamos la estrategia y ejecutamos por vos: vos confirmás.
        </p>

        <div className="biz-grid reveal">
          <div className="biz">
            <span className="biz-tag">Negocio 01 · Empresa</span>
            <h3>Gestión de liquidez</h3>
            <p>
              Administramos la liquidez y el capital de trabajo de tu empresa para que cada peso rinda sin perder disponibilidad. Diseñamos la estrategia, seleccionamos los instrumentos y operamos por vos, con criterio profesional y sin costo de asesoramiento. Vos no perdés tiempo: ejecutamos nosotros, vos confirmás.
            </p>
          </div>

          <div className="biz">
            <span className="biz-tag">Negocio 02 · Socios</span>
            <h3>Portfolio Manager</h3>
            <p>
              Somos portfolio manager del patrimonio personal de los socios. Construimos una cartera a medida de cada perfil y objetivo, operando con las principales sociedades de bolsa del país y con acceso a informes privados institucionales. La misma exigencia profesional que aplicamos a la empresa, ahora para vos y tus socios.
            </p>
          </div>
        </div>

        <div className="liquidity-operators reveal" aria-label="Operamos con Balanz y AdCap, entre otras">
          <span className="liquidity-operators__label">Operamos con</span>

          <span className="liquidity-operators__logo liquidity-operators__logo--balanz" aria-label="Balanz">
            <img src="/logos/balanz-clean.png" alt="" loading="lazy" decoding="async" aria-hidden="true" />
          </span>

          <span className="liquidity-operators__logo liquidity-operators__logo--adcap" aria-label="AdCap">
            <img src="/logos/adcap-clean.png" alt="" loading="lazy" decoding="async" aria-hidden="true" />
          </span>

          <span className="liquidity-operators__more">entre otras</span>
        </div>

        <div className="fin-cta reveal">
          <Link className="btn btn-primary" href="/#contacto">Quiero que gestionen mi liquidez</Link>
        </div>
      </div>
    </section>
  );
}

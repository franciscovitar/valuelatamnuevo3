import { whyUsHome } from '@/data/valueLatamContent';

export default function WhyUs() {
  return (
    <section className="edge" id="diferencial">
      <div className="wrap edge-grid">
        <div className="reveal">
          <span className="eyebrow">Por qué Value Latam</span>
          <h2 className="serif">{whyUsHome.title}</h2>
          <p className="body">{whyUsHome.body}</p>
          <ul>
            {whyUsHome.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="pullquote reveal">
          <p className="q">
            &ldquo;En Argentina, la mayoría de los negocios terminan siendo, en buena medida,{' '}
            <span>financieros</span>. Nuestro trabajo es que esa variable juegue a favor de la empresa.&rdquo;
          </p>
          <p className="by">— Mauricio Maggio, Socio</p>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { paymentGroups } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

export default function Payments() {
  return (
    <section className="medios" id="medios">
      <div className="wrap">
        <SectionHeading eyebrow="Unidad 03 · Medios de pago" title="Apuntamos al costo 0.">
          <p className="pay-sub">Cobrar, pagar, dar tarjetas a tu equipo e invertir el excedente, desde una sola cuenta. Y enterate cómo lo hacemos.</p>
        </SectionHeading>
        <div className="pay-hero reveal">
          <p>
            Hoy tus cobros y pagos te cuestan: Mercado Pago y otras PSP te cobran comisiones; el banco, impuestos.
            Nosotros armamos la infraestructura para que tu empresa opere hacia <b>costo cero</b>, combinando la{' '}
            <b>cuenta comitente</b> del mercado de capitales con una <b>nueva PSP</b>.
          </p>
          <p>
            Una sola cuenta para <b>cobrar, pagar, transferir, dar tarjetas a tu equipo e invertir</b> el excedente.
            La dejamos lista para operar; tu equipo solo la usa.
          </p>
        </div>
        <p className="pay-feat-hint reveal">Tocá cada caja para ver el detalle.</p>
        {paymentGroups.map(([label, items]) => (
          <div className="pay-group" key={label}>
            <span className="pay-group-label reveal">{label}</span>
            <div className="pay-features">
              {items.map(([summary, text]) => <details className="pay-feat reveal" key={summary}><summary>{summary}</summary><p>{text}</p></details>)}
            </div>
          </div>
        ))}
        <div className="pay-pillars reveal">
          <div className="pillar"><span className="pill-tag">Lo disruptivo · cómo lo hacemos</span><h3>Apuntamos al costo 0.</h3><p>Echeq por <b>cuenta comitente</b> del mercado de capitales, y transferencias y QR por la <b>nueva PSP</b>. Así sacamos las comisiones e impuestos del medio. Salí de Mercado Pago y dejá de pagar de más.</p></div>
          <div className="pillar pillar-gold"><span className="pill-tag">El camino al costo 0</span><h3>Optimización fiscal e impositiva</h3><p>Tenemos un <b>estudio contable propio de optimización fiscal e impositiva</b>, disponible para los clientes que operan con nosotros. Te mostramos, paso a paso, cómo pagar menos impuestos de forma inteligente y en regla. Es la pieza que completa el costo cero.</p></div>
        </div>
        <div className="pay-giros reveal"><h4>¿Operás con el exterior?</h4><p>También estructuramos tus pagos y giros internacionales —proveedores del exterior, factoring internacional, subrogación de deuda y asesoría cambiaria— por canales habilitados y dentro del marco normativo vigente.</p></div>
        <div className="pay-support reveal"><span className="pay-group-label reveal">Respaldo</span><p>Atención de <b>personas reales</b>, no bots ni menús eternos: te acompañamos por WhatsApp y mail mientras dejamos toda la operación montada. Todo 100% digital, con la solidez de un Agente Productor registrado en la CNV. <b>Invertir, cobrar y pagar en un solo lugar.</b></p></div>
        <div className="fin-cta reveal"><Link className="btn btn-primary" href="/#contacto">Quiero apuntar al costo 0 en mis pagos</Link></div>
      </div>
    </section>
  );
}

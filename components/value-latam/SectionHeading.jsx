/*
 * Encabezado de seccion: volanta + titulo.
 *
 * `style` existe para el unico caso que lo necesita (Metrics ajusta su margen
 * inferior). Si aparece un segundo caso conviene moverlo a CSS en vez de
 * seguir sumando excepciones aca.
 */
export default function SectionHeading({ eyebrow, title, style, children }) {
  return (
    <div className="sec-head" style={style}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="serif">{title}</h2>
      {children}
    </div>
  );
}

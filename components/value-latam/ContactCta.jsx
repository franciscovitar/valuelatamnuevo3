import Link from 'next/link';

/*
 * CTA primario hacia el formulario de contacto.
 *
 * Ocho secciones repetian exactamente este markup y solo cambiaba el texto.
 *
 * Los demas botones del sitio NO usan este componente a proposito: son un
 * <button type="submit">, anclas dentro de la misma pagina y un enlace externo
 * con target="_blank". Comparten las clases CSS pero no el elemento ni la
 * semantica, y unificarlos exigiria una capa polimorfica que cambiaria el
 * comportamiento de navegacion.
 */
export default function ContactCta({ href = '/#contacto', children }) {
  return (
    <Link className="btn btn-primary" href={href}>
      {children}
    </Link>
  );
}

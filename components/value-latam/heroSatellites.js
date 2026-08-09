import { HERO_WORDS } from './heroWordCloudConfig';
import { HERO_IMAGES } from './heroImageSatellites';

/*
 * Punto unico de configuracion del hero: decide que renderizan los satelites.
 *
 *   'words'   -> palabras flotando (variante original)
 *   'images'  -> recuadros de imagen
 *
 * Es lo unico que hay que tocar para cambiar de variante. Las dos configuraciones
 * conviven vivas: cambiar el modo no borra ni comenta nada.
 */
export const HERO_SATELLITE_MODE = 'images';

/**
 * Satelites de la variante activa.
 *
 * Las dos listas comparten forma (posicion, profundidad, deriva y ventana de
 * convergencia), asi que el runtime de movimiento no necesita saber cual esta
 * activa: solo cambia lo que se pinta adentro de cada satelite.
 */
export function getHeroSatellites() {
  return HERO_SATELLITE_MODE === 'images' ? HERO_IMAGES : HERO_WORDS;
}

export function isHeroImageMode() {
  return HERO_SATELLITE_MODE === 'images';
}

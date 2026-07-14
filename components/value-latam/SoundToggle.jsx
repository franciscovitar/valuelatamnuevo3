export default function SoundToggle() {
  return (
    <button id="sound-toggle" className="sound-toggle" aria-pressed="false" aria-label="Activar música de fondo">
      <span className="sicon" aria-hidden="true" /><span className="slabel">Sonido</span>
    </button>
  );
}

export function initSoundToggle() {
  const button = document.getElementById('sound-toggle');
  if (!button) return () => {};

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let context = null;
  let gain = null;
  let oscillators = [];
  let playing = false;

  const stop = () => {
    playing = false;
    button.setAttribute('aria-pressed', 'false');
    button.classList.remove('is-on');
    if (gain) gain.gain.setTargetAtTime(0, context.currentTime, 0.08);
    oscillators.forEach((oscillator) => {
      try { oscillator.stop(context.currentTime + 0.12); } catch {}
    });
    oscillators = [];
  };

  const start = async () => {
    if (!AudioContext) return;
    context ||= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);
    oscillators = [110, 165, 220].map((frequency) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });
    gain.gain.setTargetAtTime(0.025, context.currentTime, 0.14);
    playing = true;
    button.setAttribute('aria-pressed', 'true');
    button.classList.add('is-on');
  };

  const onClick = () => {
    if (playing) stop();
    else start();
  };

  button.addEventListener('click', onClick);
  return () => {
    button.removeEventListener('click', onClick);
    stop();
  };
}

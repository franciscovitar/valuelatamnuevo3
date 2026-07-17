const ACTIVE_VOLUME = 0.1;
const FADE_IN_DURATION = 1;
const FADE_OUT_DURATION = 0.8;
const MELODY_INTERVAL_MS = 1250;
const NOTE_PROBABILITY = 0.72;
const PAD_FREQUENCIES = [110, 164.81, 220, 277.18];
const SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0];

export function initSoundToggle() {
  const button = document.getElementById('sound-toggle');
  if (!button) return () => {};

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    button.style.display = 'none';
    return () => {};
  }

  let context = null;
  let masterGain = null;
  let lowPassFilter = null;
  let delayNode = null;
  let feedbackGain = null;
  let wetGain = null;
  let padGain = null;
  let padOscillators = [];
  let lfoOscillator = null;
  let lfoGain = null;
  let melodyInterval = null;
  const activeMelodyVoices = new Set();

  let playing = false;
  let initialized = false;
  let destroyed = false;
  let toggling = false;
  let noteIdx = 0;

  const labelEl = button.querySelector('.slabel');

  const fadeMasterTo = (targetVolume, duration) => {
    if (!masterGain || !context) return;
    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(targetVolume, now + duration);
  };

  const updateButtonState = () => {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute(
      'aria-label',
      playing ? 'Silenciar música de fondo' : 'Activar música de fondo',
    );
    button.classList.toggle('is-on', playing);
    if (labelEl) {
      labelEl.textContent = playing ? 'Sonido activado' : 'Sonido';
    }
  };

  const playMelodyNote = () => {
    if (!context || !lowPassFilter || !delayNode || destroyed) return;

    const startTime = context.currentTime + 0.05;
    const frequency = SCALE[noteIdx % SCALE.length];
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;

    const voiceGain = context.createGain();
    voiceGain.gain.setValueAtTime(0, startTime);
    voiceGain.gain.linearRampToValueAtTime(0.1, startTime + 0.06);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.7);

    oscillator.connect(voiceGain);
    voiceGain.connect(lowPassFilter);
    voiceGain.connect(delayNode);

    const voice = { oscillator, voiceGain };
    activeMelodyVoices.add(voice);

    oscillator.onended = () => {
      activeMelodyVoices.delete(voice);
      try {
        oscillator.disconnect();
        voiceGain.disconnect();
      } catch {
        // oscillator may already be stopped
      }
    };

    oscillator.start(startTime);
    oscillator.stop(startTime + 1.8);
  };

  const tickMelody = () => {
    if (destroyed || !playing || !context) return;

    if (Math.random() < NOTE_PROBABILITY) {
      playMelodyNote();
    }

    noteIdx += Math.random() > 0.5 ? 1 : 2;
  };

  const initAudioGraph = () => {
    context = new AudioContextClass();

    masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    lowPassFilter = context.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 680;
    lowPassFilter.Q.value = 0.6;

    delayNode = context.createDelay(1);
    delayNode.delayTime.value = 0.34;

    feedbackGain = context.createGain();
    feedbackGain.gain.value = 0.34;

    wetGain = context.createGain();
    wetGain.gain.value = 0.22;

    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);
    delayNode.connect(wetGain);
    wetGain.connect(masterGain);

    lowPassFilter.connect(masterGain);
    lowPassFilter.connect(delayNode);

    padGain = context.createGain();
    padGain.gain.value = 0.13;
    padGain.connect(lowPassFilter);

    padOscillators = PAD_FREQUENCIES.map((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = (index - 1.5) * 4;

      const gain = context.createGain();
      gain.gain.value = 0.2;
      oscillator.connect(gain);
      gain.connect(padGain);
      oscillator.start();

      return { oscillator, gain };
    });

    lfoOscillator = context.createOscillator();
    lfoOscillator.frequency.value = 0.05;

    lfoGain = context.createGain();
    lfoGain.gain.value = 240;

    lfoOscillator.connect(lfoGain);
    lfoGain.connect(lowPassFilter.frequency);
    lfoOscillator.start();

    melodyInterval = window.setInterval(tickMelody, MELODY_INTERVAL_MS);

    initialized = true;
    return true;
  };

  const stopActiveMelodyVoices = () => {
    activeMelodyVoices.forEach((voice) => {
      try {
        voice.oscillator.stop();
      } catch {
        // voice may already have ended
      }
      try {
        voice.oscillator.disconnect();
        voice.voiceGain.disconnect();
      } catch {
        // nodes may already be disconnected
      }
    });
    activeMelodyVoices.clear();
  };

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;
    playing = false;

    button.removeEventListener('click', onClick);

    if (melodyInterval) {
      window.clearInterval(melodyInterval);
      melodyInterval = null;
    }

    stopActiveMelodyVoices();

    const padGains = padOscillators.map(({ gain }) => gain);
    padOscillators.forEach(({ oscillator }) => {
      try {
        oscillator.stop();
      } catch {
        // pad may already be stopped
      }
    });
    padOscillators = [];

    if (lfoOscillator) {
      try {
        lfoOscillator.stop();
      } catch {
        // lfo may already be stopped
      }
      lfoOscillator = null;
    }

    [
      masterGain,
      lowPassFilter,
      delayNode,
      feedbackGain,
      wetGain,
      padGain,
      lfoGain,
      ...padGains,
    ].forEach((node) => {
      try {
        node?.disconnect();
      } catch {
        // node may already be disconnected
      }
    });

    if (context) {
      context.close().catch(() => {});
      context = null;
    }
  };

  const onClick = async () => {
    if (destroyed || toggling) return;
    toggling = true;

    try {
      if (!initialized) {
        try {
          initAudioGraph();
        } catch {
          button.style.display = 'none';
          return;
        }
      }

      if (!context) return;

      if (context.state === 'suspended') {
        try {
          await context.resume();
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[sound-toggle] AudioContext resume failed:', error);
          }
          return;
        }
      }

      playing = !playing;
      updateButtonState();
      fadeMasterTo(playing ? ACTIVE_VOLUME : 0, playing ? FADE_IN_DURATION : FADE_OUT_DURATION);
    } finally {
      toggling = false;
    }
  };

  button.addEventListener('click', onClick);
  updateButtonState();

  return cleanup;
}

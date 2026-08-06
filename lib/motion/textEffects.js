import { gsap, ScrollTrigger } from '@/lib/scroll/gsap';
import {
  BLUR_CLEAR_PROPS,
  MOTION_SYSTEM,
  motionTier,
  prefersReducedMotion,
} from '@/lib/motion/tokens';
import { triggerStart } from '@/lib/scroll/home/utils';

const MUTED = 'rgba(246, 243, 236, 0.15)';
const ACTIVE = '#F6F3EC';
const GOLD = '#E2C98A';

function storeOriginal(element) {
  if (element && element.dataset.vlTextOriginal === undefined) {
    element.dataset.vlTextOriginal = element.innerHTML;
  }
}

export function restoreTextSplit(element) {
  if (!element) return;
  const html = element.dataset.vlTextOriginal;
  if (html !== undefined) {
    element.innerHTML = html;
    delete element.dataset.vlTextOriginal;
  }
  delete element.dataset.vlTextSplit;
  element.classList.remove('vl-text-paint', 'vl-line-mask', 'vl-progressive-write', 'vl-char-reveal');
  gsap.set(element, { clearProps: 'opacity,transform,color' });
}

function walkTextNodes(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.textContent?.length) nodes.push(node);
  }
  return nodes;
}

function wrapWords(element, { maxWords = 45 } = {}) {
  if (element.dataset.vlTextSplit === 'words' || element.dataset.vlTextSplit === 'paint') {
    return gsap.utils.toArray(element.querySelectorAll('.vl-tx-word'));
  }

  storeOriginal(element);
  element.classList.add('vl-text-paint');
  element.dataset.vlTextSplit = 'words';

  const textNodes = walkTextNodes(element);
  const words = [];
  let count = 0;

  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part.trim()) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      if (count >= maxWords) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const span = document.createElement('span');
      span.className = 'vl-tx-word';
      span.textContent = part;
      span.dataset.word = part.toLowerCase().replace(/[.,;:!?¿¡]/g, '');
      fragment.appendChild(span);
      words.push(span);
      count += 1;
    });

    node.parentNode?.replaceChild(fragment, node);
  });

  return words;
}

function groupLines(element, unitSelector) {
  const units = gsap.utils.toArray(element.querySelectorAll(unitSelector));
  if (!units.length) return [];

  const lines = [];
  let line = [];
  let top = null;

  units.forEach((unit) => {
    const unitTop = Math.round(unit.offsetTop);
    if (top !== null && unitTop > top + 2) {
      lines.push(line);
      line = [];
    }
    line.push(unit);
    top = unitTop;
  });

  if (line.length) lines.push(line);

  return lines.map((lineUnits) => {
    const wrap = document.createElement('span');
    wrap.className = 'vl-tx-line';
    const inner = document.createElement('span');
    inner.className = 'vl-tx-line__inner';

    const first = lineUnits[0];
    first.parentNode?.insertBefore(wrap, first);
    lineUnits.forEach((unit, index) => {
      inner.appendChild(unit);
      if (index < lineUnits.length - 1) {
        inner.appendChild(document.createTextNode(' '));
      }
    });
    wrap.appendChild(inner);
    return inner;
  });
}

function goldWordSet(words, goldPhrases = []) {
  const set = new Set();
  if (!goldPhrases.length) return set;

  const normalized = words.map((w) => w.dataset.word || w.textContent.toLowerCase());
  goldPhrases.forEach((phrase) => {
    const phraseWords = phrase.toLowerCase().split(/\s+/).filter(Boolean);
    for (let i = 0; i <= normalized.length - phraseWords.length; i += 1) {
      const slice = normalized.slice(i, i + phraseWords.length);
      if (phraseWords.every((pw, idx) => slice[idx] === pw.replace(/[.,;:!?¿¡]/g, ''))) {
        for (let j = 0; j < phraseWords.length; j += 1) set.add(i + j);
      }
    }
  });
  return set;
}

function paintStart(ctx) {
  return triggerStart(ctx);
}

/** Text paint — palabras apagadas que se pintan al entrar en pantalla. */
export function initTextPaint(element, ctx, options = {}) {
  if (!element) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    restoreTextSplit(element);
    return () => {};
  }

  const words = wrapWords(element, { maxWords: options.maxWords ?? 45 });
  if (!words.length) return () => {};

  element.dataset.vlTextSplit = 'paint';
  const goldSet = goldWordSet(words, options.goldPhrases ?? []);
  const muted = options.muted ?? MUTED;
  const active = options.active ?? ACTIVE;
  const gold = options.gold ?? GOLD;
  const delay = options.delay ?? 0.06;
  const stagger = options.stagger ?? MOTION_SYSTEM.wordStagger;
  const wordDuration = options.wordDuration ?? 0.68;

  gsap.set(element, { opacity: 1 });
  gsap.set(words, { color: muted });

  const trigger = options.trigger || element;
  let played = false;
  let tween = null;
  let st = null;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();

    tween = gsap.timeline({ delay });
    words.forEach((word, index) => {
      tween.to(
        word,
        {
          color: goldSet.has(index) ? gold : active,
          duration: wordDuration,
          ease: MOTION_SYSTEM.easeOut,
        },
        index * stagger,
      );
    });
  };

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? paintStart(ctx),
    once: true,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
    restoreTextSplit(element);
  };
}

/** Line mask reveal — ascenso dentro de máscara. */
export function initLineMaskReveal(element, ctx, options = {}) {
  if (!element) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    restoreTextSplit(element);
    return () => {};
  }

  restoreTextSplit(element);
  storeOriginal(element);
  element.classList.add('vl-line-mask');
  element.dataset.vlTextSplit = 'lines';

  const words = wrapWords(element, { maxWords: options.maxWords ?? 45 });
  const lines = groupLines(element, '.vl-tx-word');
  if (!lines.length) return () => {};

  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.remove();
  });

  gsap.set(element, { opacity: 1 });
  gsap.set(lines, { y: '108%', opacity: 1 });

  const trigger = options.trigger || element;
  const duration = options.duration ?? MOTION_SYSTEM.title;
  const stagger = options.stagger ?? MOTION_SYSTEM.stagger;
  let played = false;
  let tween = null;
  let st = null;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();
    tween = gsap.to(lines, {
      y: 0,
      duration,
      stagger,
      ease: options.ease ?? MOTION_SYSTEM.easeOut,
      clearProps: 'transform',
    });
  };

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: true,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
    restoreTextSplit(element);
  };
}

/** Escritura progresiva — frases o palabras con opacity + y mínimo. */
export function initProgressiveWrite(element, ctx, options = {}) {
  if (!element) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    restoreTextSplit(element);
    return () => {};
  }

  restoreTextSplit(element);
  storeOriginal(element);
  element.classList.add('vl-progressive-write');
  element.dataset.vlTextSplit = 'progressive';

  const mode = options.mode ?? 'phrases';
  let units = [];

  if (mode === 'phrases') {
    const raw = element.textContent.trim();
    const parts = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
    element.textContent = '';
    parts.forEach((part, index) => {
      const span = document.createElement('span');
      span.className = 'vl-tx-phrase';
      span.textContent = part + (index < parts.length - 1 ? ' ' : '');
      element.appendChild(span);
      units.push(span);
    });
  } else {
    units = wrapWords(element, { maxWords: options.maxWords ?? 45 });
  }

  if (!units.length) return () => {};

  const tier = motionTier(options.tier ?? 'base', ctx);
  const blur = options.blur ?? tier.blur;

  gsap.set(element, { opacity: 1 });
  gsap.set(units, {
    opacity: 0,
    y: options.y ?? tier.distance * 0.55,
    ...(blur > 0 ? { filter: `blur(${blur}px)` } : null),
  });

  const trigger = options.trigger || element;
  let played = false;
  let tween = null;
  let st = null;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();
    tween = gsap.to(units, {
      opacity: 1,
      y: 0,
      ...(blur > 0 ? { filter: 'blur(0px)' } : null),
      duration: options.duration ?? tier.duration,
      stagger: options.stagger ?? (mode === 'phrases' ? MOTION_SYSTEM.stagger : MOTION_SYSTEM.wordStagger),
      ease: tier.ease,
      clearProps: BLUR_CLEAR_PROPS,
    });
  };

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: true,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
    restoreTextSplit(element);
  };
}

/**
 * Convergencia por caracteres — el titular se arma desde letras dispersas
 * y desenfocadas. Reservado para el protagonista de una sección: aplicado a
 * cada h2 se vuelve ruido y arruina la lectura.
 *
 * Cada carácter parte de un offset propio (no de un desplazamiento común),
 * porque un bloque entero moviéndose junto se lee como un fade y no como una
 * frase que se arma. Las palabras no se parten entre líneas: el split respeta
 * el espacio y deja que el navegador maquete normalmente.
 *
 * Aplica solo sobre texto plano: el split aplana el marcado interno, así que
 * un título con <span> o <em> pierde ese formato. Para titulares con frase
 * dorada usar initLineMaskReveal + initPhraseColorSweep.
 */
export function initCharConverge(element, ctx, options = {}) {
  if (!element) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    restoreTextSplit(element);
    return () => {};
  }

  restoreTextSplit(element);
  storeOriginal(element);
  element.classList.add('vl-char-reveal');
  element.dataset.vlTextSplit = 'chars';

  const tier = motionTier(options.tier ?? 'lead', ctx);
  const text = element.textContent.replace(/\s+/g, ' ').trim();
  const maxChars = options.maxChars ?? 90;

  if (!text || text.length > maxChars) {
    // Demasiado largo para convergencia por carácter: cae a líneas.
    restoreTextSplit(element);
    return initLineMaskReveal(element, ctx, options);
  }

  element.textContent = '';

  const chars = [];

  text.split(' ').forEach((word, wordIndex, words) => {
    const wordWrap = document.createElement('span');
    wordWrap.className = 'vl-tx-cword';

    word.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'vl-tx-char';
      span.textContent = char;
      wordWrap.appendChild(span);
      chars.push(span);
    });

    element.appendChild(wordWrap);

    if (wordIndex < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });

  if (!chars.length) return () => {};

  const spread = options.spread ?? tier.distance;
  const blur = options.blur ?? tier.blur;
  const rand = gsap.utils.random;

  gsap.set(element, { opacity: 1 });

  // Offset irregular por carácter; algunos arrancan casi en destino.
  chars.forEach((char) => {
    gsap.set(char, {
      x: rand(-spread, spread),
      y: rand(-spread * 0.55, spread * 0.9),
      opacity: rand(0.06, 0.34),
      filter: `blur(${rand(blur * 0.55, blur * 1.4)}px)`,
    });
  });

  const trigger = options.trigger || element;
  let played = false;
  let tween = null;
  let st = null;

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();
    tween = gsap.to(chars, {
      x: 0,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: options.duration ?? tier.duration,
      stagger: {
        each: options.stagger ?? 0.022,
        from: options.from ?? 'random',
      },
      ease: options.ease ?? tier.ease,
      clearProps: BLUR_CLEAR_PROPS,
    });
  };

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: true,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
    restoreTextSplit(element);
  };
}

/** @deprecated Nombre previo de initCharConverge. */
export const initCharReveal = initCharConverge;

/** Fade simple para eyebrows. */
export function initFadeReveal(elements, ctx, options = {}) {
  const items = gsap.utils.toArray(elements).filter(Boolean);
  if (!items.length) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0, clearProps: 'transform,opacity' });
    return () => {};
  }

  const tier = motionTier(options.tier ?? 'quiet', ctx);
  const blur = options.blur ?? tier.blur;

  gsap.set(items, {
    opacity: 0,
    y: options.y ?? tier.distance,
    ...(blur > 0 ? { filter: `blur(${blur}px)` } : null),
  });

  let played = false;
  let tween = null;
  let st = null;
  const trigger = options.trigger || items[0];

  const play = () => {
    if (played) return;
    played = true;
    tween?.kill();
    st?.kill();
    tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      ...(blur > 0 ? { filter: 'blur(0px)' } : null),
      duration: options.duration ?? tier.duration,
      stagger: options.stagger ?? tier.stagger,
      ease: tier.ease,
      clearProps: BLUR_CLEAR_PROPS,
    });
  };

  st = ScrollTrigger.create({
    trigger,
    start: options.start ?? triggerStart(ctx),
    once: true,
    onEnter: play,
  });
  if (st.progress > 0) play();

  return () => {
    st?.kill();
    tween?.kill();
  };
}

/** Barrido de color sobre frase dentro de un título ya revelado. */
function wrapWordsInContainer(container, { maxWords = 45 } = {}) {
  if (container.querySelector('.vl-tx-word')) {
    return gsap.utils.toArray(container.querySelectorAll('.vl-tx-word'));
  }

  const textNodes = walkTextNodes(container);
  const words = [];
  let count = 0;

  textNodes.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part.trim()) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      if (count >= maxWords) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const span = document.createElement('span');
      span.className = 'vl-tx-word';
      span.textContent = part;
      span.dataset.word = part.toLowerCase().replace(/[.,;:!?¿¡]/g, '');
      fragment.appendChild(span);
      words.push(span);
      count += 1;
    });

    node.parentNode?.replaceChild(fragment, node);
  });

  return words;
}

export function initPhraseColorSweep(element, ctx, phrase, options = {}) {
  if (!element || !phrase) return () => {};
  if (ctx?.reduced || prefersReducedMotion()) return () => {};

  const inners = gsap.utils.toArray(element.querySelectorAll('.vl-tx-line__inner'));
  const roots = inners.length ? inners : [element];
  const words = roots.flatMap((root) => wrapWordsInContainer(root, { maxWords: 45 }));
  const goldSet = goldWordSet(words, [phrase]);
  if (!goldSet.size) return () => {};

  gsap.set([...goldSet].map((i) => words[i]), { color: ACTIVE });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: options.trigger || element,
      start: options.start ?? triggerStart(ctx),
      end: options.end ?? 'bottom 55%',
      scrub: options.scrub ?? 0.85,
    },
  });

  [...goldSet].forEach((index, i) => {
    tl.to(words[index], { color: options.gold ?? GOLD, ease: 'none', duration: 0.08 }, i * 0.06);
  });

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}

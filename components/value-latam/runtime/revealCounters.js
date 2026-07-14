export function initRevealCounters() {
  const cleanups = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isHomeMotionSection = (element) =>
    Boolean(element.closest('[data-vl-home-section]'));

  const isGsapSection = (element) =>
    Boolean(element.closest('[data-vl-gsap-root]'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    document.querySelectorAll('.reveal').forEach((element) => {
      if (isHomeMotionSection(element) || isGsapSection(element)) return;
      revealObserver.observe(element);
    });
    cleanups.push(() => revealObserver.disconnect());
  } else {
    document.querySelectorAll('.reveal').forEach((element) => {
      if (isHomeMotionSection(element) || isGsapSection(element)) return;
      element.classList.add('in');
    });
  }

  const counters = Array.from(document.querySelectorAll('.cv'));
  const runCounter = (element) => {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const target = Number.parseFloat(element.getAttribute('data-count') || '0');
    const decimals = Number.parseInt(element.getAttribute('data-dec') || '0', 10);

    if (reduceMotion) {
      element.textContent = target.toFixed(decimals);
      return;
    }

    const duration = 1300;
    let start = null;
    const tick = (timestamp) => {
      start ||= timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => {
      if (isHomeMotionSection(counter) || isGsapSection(counter)) return;
      counterObserver.observe(counter);
    });
    cleanups.push(() => counterObserver.disconnect());
  } else {
    counters.forEach((counter) => {
      if (isHomeMotionSection(counter) || isGsapSection(counter)) return;
      runCounter(counter);
    });
  }

  document.querySelectorAll('.sol-grid,.metrics-grid,.steps,.feat-list,.team-grid,.cycle-row,.clients,.pay-features').forEach((group) => {
    if (isHomeMotionSection(group) || isGsapSection(group)) return;

    Array.from(group.children).forEach((child, index) => {
      if (child.classList.contains('reveal')) child.style.transitionDelay = (index * 70) + 'ms';
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}

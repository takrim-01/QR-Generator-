/* COUNTER ANIMATION */
(function initCounters() {
  const elements = document.querySelectorAll('.stat-num');
  let done = false;

  function formatNum(n, target) {
    if (target >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (target >= 1000)    return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  function animate() {
    if (done) return;
    done = true;

    elements.forEach(function (el) {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const start    = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = formatNum(current, target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const hero = document.querySelector('.hero-stats');
  if (!hero) return;

  const obs = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      animate();
      obs.disconnect();
    }
  }, { threshold: .3 });
  obs.observe(hero);
})();

/* SCROLL REVEAL */
(function initReveal() {
  const selectors = [
    '.feature-card',
    '.pricing-card',
    '.type-pill',
    '.section-header',
    '.generator-wrap',
  ];

  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i * 60) + 'ms';
    });
  });

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
})();
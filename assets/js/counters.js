/* Counters: animate [data-count] numbers up when first scrolled into view.
   Supports data-prefix / data-suffix (e.g. "≈" and "×" or "+"). */
(function () {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const format = (n) => (n >= 1000 ? n.toLocaleString('en-US') : String(n));

  const render = (el, value) => {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    el.textContent = prefix + format(value) + suffix;
  };

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (reduce) return render(el, target);

    const dur = 1100;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      render(el, Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach((el) => render(el, parseFloat(el.dataset.count)));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((el) => io.observe(el));
})();

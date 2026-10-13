(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fireflies drifting over the forest.
  const swarm = document.querySelector('.fireflies');
  if (swarm && !reduceMotion) {
    for (let i = 0; i < 22; i++) {
      const ff = document.createElement('span');
      ff.style.left = (Math.random() * 100).toFixed(1) + '%';
      ff.style.top = (55 + Math.random() * 40).toFixed(1) + '%';
      ff.style.setProperty('--dx', (Math.random() * 80 - 40).toFixed(0) + 'px');
      ff.style.setProperty('--dy', (Math.random() * -70 - 10).toFixed(0) + 'px');
      ff.style.animationDuration = (6 + Math.random() * 8).toFixed(1) + 's, ' + (2 + Math.random() * 3).toFixed(1) + 's';
      ff.style.animationDelay = (-Math.random() * 10).toFixed(1) + 's, ' + (-Math.random() * 4).toFixed(1) + 's';
      swarm.appendChild(ff);
    }
  }

  // Fade sections in as they scroll into view.
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // Gentle parallax on the forest layers, and a solid nav once past the hero.
  const nav = document.querySelector('.nav');
  const layers = [
    [document.querySelector('.stars'), 0.35],
    [document.querySelector('.forest-back'), 0.18],
    [document.querySelector('.forest-mid'), 0.09],
  ];
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (!reduceMotion && y < window.innerHeight * 1.2) {
      layers.forEach(function (l) {
        if (l[0]) l[0].style.transform = 'translateY(' + (y * l[1]).toFixed(1) + 'px)';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // Soft spotlight that follows the pointer across each app card.
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

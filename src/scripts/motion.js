/* ==========================================================================
   VELOCITY FINANCE — MOTION LOGIC
   Staggered Load Reveals · IntersectionObserver Scroll Triggers
   ========================================================================== */

export function initMotion() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Staggered H1 reveal on load
  const h1Lines = document.querySelectorAll('.h1-line');
  const heroImg = document.querySelector('.hero-image-wrap');

  if (isReducedMotion) {
    h1Lines.forEach(line => line.classList.add('is-revealed'));
    heroImg?.classList.add('is-revealed');
  } else {
    // Initial staggered H1 reveal
    h1Lines.forEach((line, idx) => {
      setTimeout(() => {
        line.classList.add('is-revealed');
      }, 100 + idx * 60);
    });

    // Reveal hero image with clip wipe
    setTimeout(() => {
      heroImg?.classList.add('is-revealed');
    }, 240);
  }

  // Scroll Fade-Up using IntersectionObserver
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window && !isReducedMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // run once
        }
      });
    }, {
      rootMargin: '120px 0px 120px 0px',
      threshold: 0.01
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
}

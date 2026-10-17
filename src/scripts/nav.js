/* ==========================================================================
   VELOCITY FINANCE — NAVIGATION CONTROLLER
   Sticky Scroll Transition · Mobile Full-Screen Sheet · Active Section Tracking
   ========================================================================== */

export function initNav() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileSheet = document.querySelector('.mobile-sheet');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const desktopLinks = document.querySelectorAll('.nav-link');

  // Sticky header transition on scroll
  function handleScroll() {
    if (window.scrollY > 20) {
      header?.classList.add('is-scrolled');
    } else {
      header?.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile navigation drawer toggle
  function toggleMobileMenu(isOpen) {
    const shouldOpen = typeof isOpen === 'boolean' ? isOpen : !mobileSheet?.classList.contains('is-open');
    if (shouldOpen) {
      mobileSheet?.classList.add('is-open');
      toggleBtn?.classList.add('is-active');
      toggleBtn?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      mobileSheet?.classList.remove('is-open');
      toggleBtn?.classList.remove('is-active');
      toggleBtn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => toggleMobileMenu());
  }

  // Close mobile menu when link clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileSheet?.classList.contains('is-open')) {
      toggleMobileMenu(false);
    }
  });

  // Section Spy: Highlight active desktop link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          desktopLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('is-active');
            } else {
              link.classList.remove('is-active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
  }
}

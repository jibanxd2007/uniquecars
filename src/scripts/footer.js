/* ==========================================================================
   UNIQUE CARS (NZ) LTD — FOOTER CONTROLLER
   Clean & Simple: Back-to-Top · Dynamic Year
   ========================================================================== */

export function initFooter() {
  // 1. Smooth Back to Top
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 2. Dynamic Copyright Year
  const yearEl = document.getElementById('footer-copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

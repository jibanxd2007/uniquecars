/* ==========================================================================
   UNIQUE CARS (NZ) LTD — FOOTER CONTROLLER
   Back-to-Top · Stock Alert Subscription · Dynamic Year
   ========================================================================== */

export function initFooter() {
  // 1. Back to Top Smooth Scroll
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

  // 2. VIP Vehicle Stock & Low-Rate Alerts Form
  const alertForm = document.getElementById('footer-alert-form');
  const alertSuccess = document.getElementById('footer-alert-success');
  const alertInput = document.getElementById('footer-alert-email');

  if (alertForm) {
    alertForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = alertInput?.value?.trim();
      if (!email || !email.includes('@')) {
        alertInput?.focus();
        return;
      }

      // Smooth transition to success state
      alertForm.style.display = 'none';
      if (alertSuccess) {
        alertSuccess.classList.add('is-active');
        alertSuccess.setAttribute('aria-hidden', 'false');
      }
    });
  }

  // 3. Dynamic Copyright Year
  const yearEl = document.getElementById('footer-copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

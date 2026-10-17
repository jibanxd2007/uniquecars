/* ==========================================================================
   UNIQUE CARS (NZ) LTD — APPLICATION ENTRY
   ========================================================================== */

import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/sections.css';
import '../styles/motion.css';

import { initNav } from './nav.js';
import { initEstimator } from './estimator.js';
import { initApplyForm } from './form.js';
import { initDisclosures } from './disclosures.js';
import { initMotion } from './motion.js';
import { initFooter } from './footer.js';

function initShowroomStatus() {
  const statusEl = document.getElementById('live-showroom-status');
  if (!statusEl) return;

  try {
    // Current time in Pacific/Auckland
    const now = new Date();
    const nzFormatter = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = nzFormatter.formatToParts(now);
    const weekday = parts.find(p => p.type === 'weekday')?.value;
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value, 10);
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value, 10);
    const decimalTime = hour + minute / 60;

    let isOpen = false;
    let closingTime = '5.00pm';

    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)) {
      isOpen = decimalTime >= 9.0 && decimalTime < 17.0;
      closingTime = '5.00pm';
    } else if (weekday === 'Sat') {
      isOpen = decimalTime >= 9.0 && decimalTime < 16.0;
      closingTime = '4.00pm';
    } else if (weekday === 'Sun') {
      isOpen = decimalTime >= 9.0 && decimalTime < 14.0;
      closingTime = '2.00pm';
    }

    if (isOpen) {
      statusEl.innerHTML = `<span class="status-dot-green"></span><span>Open Now &bull; Closes ${closingTime}</span>`;
    } else {
      statusEl.innerHTML = `<span class="status-dot-amber"></span><span>Closed Now &bull; Opens 9.00am</span>`;
    }
  } catch (e) {
    // Fallback gracefully
    statusEl.innerHTML = `<span class="status-dot-green"></span><span>Open Today &bull; 327 Great South Rd</span>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initEstimator();
  initApplyForm();
  initDisclosures();
  initMotion();
  initFooter();
  initShowroomStatus();
});

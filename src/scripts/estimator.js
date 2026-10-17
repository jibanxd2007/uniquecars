/* ==========================================================================
   UNIQUE CARS (NZ) LTD — VEHICLE FINANCE ESTIMATOR
   Formula · Slider Event Handling · Segmented Controls · Animation
   Compliant with NZ CCCFA Responsible Lending Estimates
   ========================================================================== */

export const DEFAULT_RATE = 0.0895; // 8.95% p.a.

export function initEstimator() {
  const amountSlider = document.getElementById('slider-amount');
  const amountInput = document.getElementById('field-price') || document.getElementById('input-amount');
  const termSlider = document.getElementById('slider-term');
  const rateSelect = document.getElementById('slider-rate');
  const weeklyDisplay = document.getElementById('figure-weekly');

  if (!amountSlider || !weeklyDisplay) return;

  let currentDisplayValue = 315;
  let activeTermYears = 3;
  let activeRate = 0.0895;

  function updateSliderFill(slider) {
    if (!slider) return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', `${pct}%`);
  }

  function calculateWeekly(principal, annualRate, termYears) {
    if (principal <= 0) return 0;
    const weeks = termYears * 52;
    const weeklyRate = annualRate / 52;
    const factor = Math.pow(1 + weeklyRate, weeks);
    const weeklyPayment = principal * ((weeklyRate * factor) / (factor - 1));
    return Math.round(weeklyPayment);
  }

  function animateFigure(startVal, endVal, duration = 200) {
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startVal + (endVal - startVal) * ease);
      weeklyDisplay.textContent = `NZ$ ${val}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        weeklyDisplay.textContent = `NZ$ ${endVal}`;
        currentDisplayValue = endVal;
      }
    }
    requestAnimationFrame(step);
  }

  function recalculate() {
    const amount = parseInt(amountSlider.value, 10) || 45000;
    if (amountInput && document.activeElement !== amountInput) {
      amountInput.value = amount;
    }

    if (termSlider) {
      activeTermYears = parseInt(termSlider.value, 10) || 3;
    }

    if (rateSelect) {
      activeRate = parseFloat(rateSelect.value) || 0.0895;
    }

    updateSliderFill(amountSlider);

    const newWeekly = calculateWeekly(amount, activeRate, activeTermYears);
    animateFigure(currentDisplayValue, newWeekly);

    // Sync active state on preset chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      const chipAmt = parseInt(chip.dataset.amount, 10);
      chip.classList.toggle('is-active', chipAmt === amount);
    });

    // Sync active state on term pills
    document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
      const pillTerm = parseInt(pill.dataset.term, 10);
      pill.classList.toggle('is-active', pillTerm === activeTermYears);
    });

    // Sync active state on rate pills
    document.querySelectorAll('#rate-pills .calc-pill').forEach(pill => {
      const pillRate = parseFloat(pill.dataset.rate);
      pill.classList.toggle('is-active', Math.abs(pillRate - activeRate) < 0.001);
    });

    // Dispatch update for review summary in step 3
    window.dispatchEvent(new CustomEvent('uniquecars:estimator-updated', {
      detail: { amount, termYears: activeTermYears, rate: activeRate, weekly: newWeekly }
    }));
  }

  // Segmented Term Pills (24 / 36 / 48 / 60 mo)
  document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const t = parseInt(pill.dataset.term, 10);
      if (!isNaN(t)) {
        activeTermYears = t;
        if (termSlider) termSlider.value = t;
        recalculate();
      }
    });
  });

  // Segmented Rate Pills (8.95% / 9.95% / 11.95%)
  document.querySelectorAll('#rate-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const r = parseFloat(pill.dataset.rate);
      if (!isNaN(r)) {
        activeRate = r;
        if (rateSelect) rateSelect.value = r;
        recalculate();
      }
    });
  });

  // Preset Chips ($15k / $20k / $35k / $50k)
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const targetAmount = parseInt(chip.dataset.amount, 10);
      if (!isNaN(targetAmount)) {
        amountSlider.value = targetAmount;
        if (amountInput) amountInput.value = targetAmount;
        recalculate();
      }
    });
  });

  // Slider & Input binding
  amountSlider.addEventListener('input', recalculate);
  amountSlider.addEventListener('change', recalculate);

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      const val = parseInt(amountInput.value, 10);
      if (!isNaN(val) && val >= 5000 && val <= 150000) {
        amountSlider.value = val;
        recalculate();
      }
    });
  }

  if (rateSelect) {
    rateSelect.addEventListener('change', recalculate);
  }

  // Initial calculation
  recalculate();
}

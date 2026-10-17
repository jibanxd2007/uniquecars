/* ==========================================================================
   VELOCITY FINANCE — REPAYMENT ESTIMATOR
   Formula · Slider Event Handling · Count Animation · Form Prefill
   ========================================================================== */

/**
 * Placeholder annual interest rate for indicative calculation.
 * Clearly labelled as an indicative comparison rate.
 */
export const INDICATIVE_ANNUAL_INTEREST_RATE = 0.0895; // 8.95% p.a.

export function initEstimator() {
  const amountSlider = document.getElementById('slider-amount');
  const termSlider = document.getElementById('slider-term');
  const depositSlider = document.getElementById('slider-deposit');

  const amountDisplay = document.getElementById('val-amount');
  const termDisplay = document.getElementById('val-term');
  const depositDisplay = document.getElementById('val-deposit');
  const weeklyDisplay = document.getElementById('figure-weekly');
  const applyWithEstimateBtn = document.getElementById('btn-apply-estimate');

  if (!amountSlider || !termSlider || !depositSlider || !weeklyDisplay) return;

  let currentWeeklyValue = 97;

  function updateSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', `${pct}%`);
  }

  function calculateWeekly(amount, termYears, deposit) {
    const principal = Math.max(0, amount - deposit);
    if (principal <= 0) return 0;

    const weeks = termYears * 52;
    const weeklyRate = INDICATIVE_ANNUAL_INTEREST_RATE / 52;
    const factor = Math.pow(1 + weeklyRate, weeks);
    const weeklyPayment = principal * ((weeklyRate * factor) / (factor - 1));

    return Math.round(weeklyPayment);
  }

  function animateFigure(startVal, endVal, duration = 250) {
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startVal + (endVal - startVal) * ease);
      weeklyDisplay.textContent = `NZ$ ${val}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        weeklyDisplay.textContent = `NZ$ ${endVal}`;
        currentWeeklyValue = endVal;
      }
    }
    requestAnimationFrame(step);
  }

  function recalculate() {
    const rateSelect = document.getElementById('slider-rate');
    const annualRate = rateSelect ? parseFloat(rateSelect.value) : INDICATIVE_ANNUAL_INTEREST_RATE;

    const amountInput = document.getElementById('input-amount');
    const amount = parseInt(amountSlider.value, 10);
    const term = parseInt(termSlider.value, 10);
    
    if (amountInput && document.activeElement !== amountInput) {
      amountInput.value = amount;
    }

    // Deposit cannot exceed 50% of the vehicle amount
    const maxDeposit = Math.round(amount * 0.5);
    depositSlider.max = maxDeposit;
    if (parseInt(depositSlider.value, 10) > maxDeposit) {
      depositSlider.value = maxDeposit;
    }
    const deposit = parseInt(depositSlider.value, 10);

    // Update displays if present
    if (amountDisplay) amountDisplay.textContent = `NZ$ ${amount.toLocaleString('en-NZ')}`;
    const priceBadge = document.getElementById('calc-price-badge');
    if (priceBadge) priceBadge.textContent = `$${amount.toLocaleString('en-NZ')}`;
    if (termDisplay) termDisplay.textContent = `${term} ${term === 1 ? 'Year' : 'Years'}`;
    if (depositDisplay) depositDisplay.textContent = `NZ$ ${deposit.toLocaleString('en-NZ')}`;

    updateSliderFill(amountSlider);
    if (termSlider.tagName === 'INPUT') updateSliderFill(termSlider);
    if (depositSlider.tagName === 'INPUT') updateSliderFill(depositSlider);

    function calculateWeeklyWithRate(principalAmount, termYrs, dep, rate) {
      const principal = Math.max(0, principalAmount - dep);
      if (principal <= 0) return 0;
      const weeks = termYrs * 52;
      const weeklyRate = rate / 52;
      const factor = Math.pow(1 + weeklyRate, weeks);
      return Math.round(principal * ((weeklyRate * factor) / (factor - 1)));
    }

    const newWeekly = calculateWeeklyWithRate(amount, term, deposit, annualRate);
    animateFigure(currentWeeklyValue, newWeekly);

    // Sync active state on preset chips
    const currentAmt = parseInt(amountSlider.value, 10);
    document.querySelectorAll('.preset-chip').forEach(chip => {
      const chipAmt = parseInt(chip.dataset.amount, 10);
      chip.classList.toggle('is-active', chipAmt === currentAmt);
    });

    // Sync active state on term pills
    document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
      const pillTerm = parseInt(pill.dataset.term, 10);
      pill.classList.toggle('is-active', pillTerm === term);
    });

    // Sync active state on rate pills
    document.querySelectorAll('#rate-pills .calc-pill').forEach(pill => {
      const pillRate = parseFloat(pill.dataset.rate);
      pill.classList.toggle('is-active', Math.abs(pillRate - annualRate) < 0.001);
    });
  }

  // Bind segmented term pills
  document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const t = parseInt(pill.dataset.term, 10);
      if (!isNaN(t) && termSlider) {
        termSlider.value = t;
        recalculate();
      }
    });
  });

  // Bind segmented rate pills
  document.querySelectorAll('#rate-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const r = parseFloat(pill.dataset.rate);
      const rateSelect = document.getElementById('slider-rate');
      if (!isNaN(r) && rateSelect) {
        rateSelect.value = r;
        recalculate();
      }
    });
  });

  // Bind preset chip clicks
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

  // Bind Japanese Vehicle Category buttons
  document.querySelectorAll('.category-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetAmount = parseInt(btn.dataset.categoryAmount, 10);
      const make = btn.dataset.categoryMake;
      const model = btn.dataset.categoryModel;
      if (!isNaN(targetAmount) && amountSlider) {
        amountSlider.value = targetAmount;
        if (amountInput) amountInput.value = targetAmount;
        recalculate();

        // Also prefill form fields for vehicle step
        const formPrice = document.getElementById('field-price');
        if (formPrice) formPrice.value = targetAmount;
        if (make) {
          const formMake = document.getElementById('field-make');
          if (formMake) {
            formMake.value = make;
            formMake.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        if (model) {
          setTimeout(() => {
            const formModel = document.getElementById('field-model');
            if (formModel) formModel.value = model;
          }, 50);
        }

        // Smooth scroll up to calculator to see estimate
        const heroSection = document.getElementById('hero');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Bind input listeners
  [amountSlider, termSlider, depositSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', recalculate);
      slider.addEventListener('change', recalculate);
      updateSliderFill(slider);
    }
  });

  const rateSelect = document.getElementById('slider-rate');
  if (rateSelect) {
    rateSelect.addEventListener('change', recalculate);
  }

  const amountInput = document.getElementById('input-amount');
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      const val = parseInt(amountInput.value, 10);
      if (!isNaN(val) && val >= 5000 && val <= 150000) {
        amountSlider.value = val;
        recalculate();
      }
    });
  }

  // Initial calculation
  recalculate();

  // "Apply with this estimate" button action
  if (applyWithEstimateBtn) {
    applyWithEstimateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = amountSlider.value;
      const term = termSlider.value;
      const deposit = depositSlider.value;

      // Scroll to form section
      const applySection = document.getElementById('apply');
      if (applySection) {
        applySection.scrollIntoView({ behavior: 'smooth' });
      }

      // Prefill values in Form Step 2
      const formPrice = document.getElementById('field-price');
      const formTerm = document.getElementById('field-term');
      const formDeposit = document.getElementById('field-deposit');

      if (formPrice) formPrice.value = amount;
      if (formTerm) formTerm.value = term;
      if (formDeposit) formDeposit.value = deposit;

      // Trigger custom event so form updates its internal state & review summary
      window.dispatchEvent(new CustomEvent('uniquecars:estimate-applied', {
        detail: { amount, term, deposit }
      }));
      window.dispatchEvent(new CustomEvent('velocity:estimate-applied', {
        detail: { amount, term, deposit }
      }));
    });
  }
}

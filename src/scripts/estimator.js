/* ==========================================================================
   UNIQUE CARS (NZ) LTD — REPAYMENT ESTIMATOR & SMART CALCULATOR
   Formula · Credit Profile Mapping · Frequency Toggle · Breakdown Accordion · Form Prefill
   Compliant with NZ CCCFA Responsible Lending Disclosures
   ========================================================================== */

export const CREDIT_PROFILE_RATES = {
  excellent: 0.0895, // 8.95% p.a.
  good:      0.0995, // 9.95% p.a.
  fair:      0.1195, // 11.95% p.a.
  notsure:   0.1395  // 13.95% p.a.
};

export const ESTABLISHMENT_FEE = 395; // Standard NZ dealer establishment fee

export function initEstimator() {
  const amountSlider = document.getElementById('slider-amount');
  const amountInput = document.getElementById('input-amount');
  const termSlider = document.getElementById('slider-term');
  const depositSlider = document.getElementById('slider-deposit');
  const depositInput = document.getElementById('input-deposit');

  const amountDisplay = document.getElementById('val-amount');
  const priceBadge = document.getElementById('calc-price-badge');
  const weeklyDisplay = document.getElementById('figure-weekly');
  const freqLabel = document.getElementById('calc-freq-label');
  const applyWithEstimateBtn = document.getElementById('btn-apply-estimate');

  if (!amountSlider || !weeklyDisplay) return;

  let currentDisplayValue = 165;
  let activeFrequency = 'weekly'; // 'weekly' | 'fortnightly' | 'monthly'
  let activeRate = CREDIT_PROFILE_RATES.excellent;

  function updateSliderFill(slider) {
    if (!slider || slider.tagName !== 'INPUT') return;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-progress', `${pct}%`);
  }

  function calculatePeriodicPayment(principalAmount, depositAmt, annualRate, termYears, frequency) {
    const netCarPrincipal = Math.max(0, principalAmount - depositAmt);
    if (netCarPrincipal <= 0) return { payment: 0, totalPayable: 0, totalInterest: 0, financed: 0 };

    const totalFinanced = netCarPrincipal + ESTABLISHMENT_FEE;

    let periodsPerYear = 52;
    if (frequency === 'fortnightly') periodsPerYear = 26;
    if (frequency === 'monthly') periodsPerYear = 12;

    const totalPeriods = termYears * periodsPerYear;
    const periodicRate = annualRate / periodsPerYear;
    const factor = Math.pow(1 + periodicRate, totalPeriods);
    const payment = totalFinanced * ((periodicRate * factor) / (factor - 1));

    const totalRepayments = payment * totalPeriods;
    const totalInterest = Math.max(0, totalRepayments - totalFinanced);
    const totalAmountPayable = totalRepayments + depositAmt;

    return {
      payment: Math.round(payment),
      paymentExact: payment,
      totalPayable: Math.round(totalAmountPayable),
      totalInterest: Math.round(totalInterest),
      financed: Math.round(totalFinanced)
    };
  }

  function animateFigure(startVal, endVal, duration = 250) {
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
    let term = 3;
    if (termSlider) {
      term = parseInt(termSlider.value, 10) || 3;
    }

    if (amountInput && document.activeElement !== amountInput) {
      amountInput.value = amount;
    }

    // Deposit handling
    let deposit = 2000;
    if (depositSlider) {
      deposit = parseInt(depositSlider.value, 10) || 0;
    } else if (depositInput) {
      deposit = parseInt(depositInput.value, 10) || 0;
    }

    // Update displays
    if (amountDisplay) amountDisplay.textContent = `NZ$ ${amount.toLocaleString('en-NZ')}`;
    if (priceBadge) priceBadge.textContent = `$${amount.toLocaleString('en-NZ')}`;

    updateSliderFill(amountSlider);
    if (depositSlider) updateSliderFill(depositSlider);

    // Calculate with selected frequency and rate
    const calcResult = calculatePeriodicPayment(amount, deposit, activeRate, term, activeFrequency);
    animateFigure(currentDisplayValue, calcResult.payment);

    // Update frequency label
    if (freqLabel) {
      if (activeFrequency === 'weekly') freqLabel.textContent = '/ week';
      else if (activeFrequency === 'fortnightly') freqLabel.textContent = '/ fortnight';
      else if (activeFrequency === 'monthly') freqLabel.textContent = '/ month';
    }

    // Update breakdown accordion values
    const breakdownFinanced = document.getElementById('breakdown-financed');
    const breakdownRate = document.getElementById('breakdown-rate');
    const breakdownFee = document.getElementById('breakdown-fee');
    const breakdownInterest = document.getElementById('breakdown-interest');
    const breakdownTotal = document.getElementById('breakdown-total');

    if (breakdownFinanced) breakdownFinanced.textContent = `NZ$ ${calcResult.financed.toLocaleString('en-NZ')}`;
    if (breakdownRate) breakdownRate.textContent = `${(activeRate * 100).toFixed(2)}% p.a. fixed`;
    if (breakdownFee) breakdownFee.textContent = `NZ$ ${ESTABLISHMENT_FEE.toLocaleString('en-NZ')}`;
    if (breakdownInterest) breakdownInterest.textContent = `NZ$ ${calcResult.totalInterest.toLocaleString('en-NZ')}`;
    if (breakdownTotal) breakdownTotal.textContent = `NZ$ ${calcResult.totalPayable.toLocaleString('en-NZ')}`;

    // Update Representative Example disclaimer dynamically
    const repExampleText = document.getElementById('calc-rep-example');
    if (repExampleText) {
      repExampleText.textContent = `Estimate only. Representative example: NZ$ ${amount.toLocaleString('en-NZ')} vehicle with NZ$ ${deposit.toLocaleString('en-NZ')} deposit (${calcResult.financed.toLocaleString('en-NZ')} financed including $395 establishment fee) over ${term * 12} months at ${(activeRate * 100).toFixed(2)}% p.a. equals ~$${calcResult.payment}/${activeFrequency.slice(0, -2)}. Total payable: NZ$ ${calcResult.totalPayable.toLocaleString('en-NZ')}. Lending criteria and terms apply.`;
    }

    // Sync active state on preset chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      const chipAmt = parseInt(chip.dataset.amount, 10);
      chip.classList.toggle('is-active', chipAmt === amount);
    });

    // Sync active state on term pills
    document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
      const pillTerm = parseInt(pill.dataset.term, 10);
      pill.classList.toggle('is-active', pillTerm === term);
    });

    // Sync active state on credit profile pills
    document.querySelectorAll('#credit-pills .calc-pill').forEach(pill => {
      const pillProfile = pill.dataset.profile;
      const pillRate = CREDIT_PROFILE_RATES[pillProfile];
      pill.classList.toggle('is-active', Math.abs(pillRate - activeRate) < 0.0001);
    });

    // Update form prefill summary chip if present
    const prefillChip = document.getElementById('prefill-summary-text');
    if (prefillChip) {
      prefillChip.textContent = `$${amount.toLocaleString('en-NZ')} • ${term * 12} months • ~$${calcResult.payment}/wk`;
    }
  }

  // Bind Frequency Toggle (Weekly / Fortnightly / Monthly)
  document.querySelectorAll('.freq-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.freq-toggle-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFrequency = btn.dataset.freq || 'weekly';
      recalculate();
    });
  });

  // Bind Segmented Term Pills (24 / 36 / 48 / 60 months)
  document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const t = parseInt(pill.dataset.term, 10);
      if (!isNaN(t) && termSlider) {
        termSlider.value = t;
        recalculate();
      }
    });
  });

  // Bind Credit Profile Segmented Pills (Excellent / Good / Fair / Not sure)
  document.querySelectorAll('#credit-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const profile = pill.dataset.profile;
      if (profile && CREDIT_PROFILE_RATES[profile]) {
        activeRate = CREDIT_PROFILE_RATES[profile];
        // Also sync backwards-compatible select for test suite
        const rateSelect = document.getElementById('slider-rate');
        if (rateSelect) {
          rateSelect.value = activeRate;
        }
        recalculate();
      }
    });
  });

  // Bind backwards-compatible rate pills if present
  document.querySelectorAll('#rate-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const r = parseFloat(pill.dataset.rate);
      if (!isNaN(r)) {
        activeRate = r;
        const rateSelect = document.getElementById('slider-rate');
        if (rateSelect) rateSelect.value = r;
        recalculate();
      }
    });
  });

  // Bind Preset Chips ($15k / $20k / $35k / $50k)
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

  // Bind slider and input listeners
  [amountSlider, termSlider, depositSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', recalculate);
      slider.addEventListener('change', recalculate);
      updateSliderFill(slider);
    }
  });

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      const val = parseInt(amountInput.value, 10);
      if (!isNaN(val) && val >= 5000 && val <= 150000) {
        amountSlider.value = val;
        recalculate();
      }
    });
  }

  if (depositInput) {
    depositInput.addEventListener('input', () => {
      const val = parseInt(depositInput.value, 10);
      if (!isNaN(val) && depositSlider) {
        depositSlider.value = val;
        recalculate();
      }
    });
  }

  const rateSelect = document.getElementById('slider-rate');
  if (rateSelect) {
    rateSelect.addEventListener('change', () => {
      activeRate = parseFloat(rateSelect.value) || 0.0895;
      recalculate();
    });
  }

  // Breakdown Toggle (Accordion)
  const breakdownToggleBtn = document.getElementById('btn-toggle-breakdown');
  const breakdownPanel = document.getElementById('calc-breakdown-panel');
  if (breakdownToggleBtn && breakdownPanel) {
    breakdownToggleBtn.addEventListener('click', () => {
      const isOpen = breakdownPanel.classList.toggle('is-open');
      breakdownToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const arrow = breakdownToggleBtn.querySelector('.breakdown-arrow');
      if (arrow) arrow.textContent = isOpen ? '▲' : '▼';
    });
  }

  // Pre-fill triggers on vehicle cards ("Finance this car →")
  document.querySelectorAll('.btn-stock-finance').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const carPrice = parseInt(btn.dataset.price, 10);
      const carMake = btn.dataset.make;
      const carModel = btn.dataset.model;
      const carYear = btn.dataset.year;

      if (!isNaN(carPrice) && amountSlider) {
        amountSlider.value = carPrice;
        if (amountInput) amountInput.value = carPrice;
        recalculate();
      }

      // Prefill vehicle in form
      const makeField = document.getElementById('field-make');
      const modelField = document.getElementById('field-model');
      const yearField = document.getElementById('field-year');
      const priceField = document.getElementById('field-price');

      if (makeField && carMake) {
        makeField.value = carMake;
        makeField.dispatchEvent(new Event('change', { bubbles: true }));
        if (modelField && carModel) {
          setTimeout(() => { modelField.value = carModel; }, 50);
        }
      }
      if (yearField && carYear) yearField.value = carYear;
      if (priceField && carPrice) priceField.value = carPrice;

      // Scroll smoothly to form
      const formSec = document.getElementById('apply');
      if (formSec) formSec.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Initial calculation
  recalculate();

  // "Apply with these numbers →" button action
  if (applyWithEstimateBtn) {
    applyWithEstimateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = amountSlider.value;
      const term = termSlider ? termSlider.value : '3';
      const deposit = depositSlider ? depositSlider.value : (depositInput ? depositInput.value : '2000');

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

      // Dispatch event to sync form state & review summary
      window.dispatchEvent(new CustomEvent('uniquecars:estimate-applied', {
        detail: { amount, term, deposit }
      }));
      window.dispatchEvent(new CustomEvent('velocity:estimate-applied', {
        detail: { amount, term, deposit }
      }));
    });
  }
}

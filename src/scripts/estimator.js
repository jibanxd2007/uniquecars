/* ==========================================================================
   UNIQUE CARS (NZ) LTD — VEHICLE FINANCE ESTIMATOR & CCCFA CALCULATOR
   Compliant with NZ Responsible Lending & Live Site Policy
   - Finance Amount (slider + input + quick chips $10k/$15k/$20k/$35k/$50k)
   - Deposit & Trade-in deductions -> Net Principal Financed
   - Preferred Term (12 / 24 / 36 / 48 / 60 mo / Custom)
   - Payment Frequency: Weekly / Fortnightly / Monthly toggle
   - Indicative Rate: 9.95% p.a. representative example (set by lender)
   - Expandable breakdown: Principal, Indicative Rate, Term, Total Amount Payable
   ========================================================================== */

export const INDICATIVE_ANNUAL_RATE = 0.0995; // 9.95% p.a. representative example

export function calculateRepayment(principal, annualRate, termMonths, frequency = 'weekly') {
  if (principal <= 0) {
    return { payment: 0, totalPayable: 0, totalInterest: 0, totalPeriods: 0 };
  }

  let periodsPerYear = 52;
  if (frequency === 'fortnightly') periodsPerYear = 26;
  if (frequency === 'monthly') periodsPerYear = 12;

  const totalPeriods = Math.max(1, Math.round((termMonths / 12) * periodsPerYear));
  const periodicRate = annualRate / periodsPerYear;
  const factor = Math.pow(1 + periodicRate, totalPeriods);
  const periodicPayment = principal * ((periodicRate * factor) / (factor - 1));
  const roundedPayment = Math.round(periodicPayment);
  const totalPayable = roundedPayment * totalPeriods;
  const totalInterest = Math.max(0, totalPayable - principal);

  return {
    payment: roundedPayment,
    totalPayable,
    totalInterest,
    totalPeriods,
    periodsPerYear
  };
}

export function initEstimator() {
  const amountSlider = document.getElementById('slider-amount');
  const amountInput = document.getElementById('field-price') || document.getElementById('input-amount');
  const depositInput = document.getElementById('field-deposit');
  const tradeinInput = document.getElementById('field-tradein');
  const termSelect = document.getElementById('slider-term');
  const figureElement = document.getElementById('figure-weekly');
  const freqLabelElement = document.getElementById('figure-freq-label');

  if (!amountSlider || !figureElement) return;

  let currentDisplayPayment = 239;
  let activeTermMonths = 36;
  let activeFrequency = 'weekly';
  const activeRate = INDICATIVE_ANNUAL_RATE;

  function updateSliderFill(slider) {
    if (!slider) return;
    const min = parseFloat(slider.min) || 5000;
    const max = parseFloat(slider.max) || 100000;
    const val = parseFloat(slider.value) || 20000;
    const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    slider.style.setProperty('--slider-progress', `${pct}%`);
  }

  function animateFigure(startVal, endVal, duration = 180) {
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startVal + (endVal - startVal) * ease);
      figureElement.textContent = `NZ$ ${val}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        figureElement.textContent = `NZ$ ${endVal}`;
        currentDisplayPayment = endVal;
      }
    }
    requestAnimationFrame(step);
  }

  function recalculate() {
    const vehiclePrice = parseInt(amountSlider.value, 10) || 20000;
    if (amountInput && document.activeElement !== amountInput) {
      amountInput.value = vehiclePrice;
    }

    const deposit = parseInt(depositInput?.value, 10) || 0;
    const tradein = parseInt(tradeinInput?.value, 10) || 0;
    const principal = Math.max(1000, vehiclePrice - deposit - tradein);

    if (termSelect) {
      activeTermMonths = parseInt(termSelect.value, 10) || 36;
    }

    updateSliderFill(amountSlider);

    const calc = calculateRepayment(principal, activeRate, activeTermMonths, activeFrequency);
    animateFigure(currentDisplayPayment, calc.payment);

    if (freqLabelElement) {
      freqLabelElement.textContent = activeFrequency === 'weekly' ? '/ week' : (activeFrequency === 'fortnightly' ? '/ fortnight' : '/ month');
    }

    // Update expandable CCCFA breakdown elements
    const elBreakdownPrincipal = document.getElementById('breakdown-principal');
    const elBreakdownTerm = document.getElementById('breakdown-term');
    const elBreakdownTotal = document.getElementById('breakdown-total');
    const elBreakdownInterest = document.getElementById('breakdown-interest');

    if (elBreakdownPrincipal) elBreakdownPrincipal.textContent = `NZ$ ${principal.toLocaleString('en-NZ')}`;
    if (elBreakdownTerm) elBreakdownTerm.textContent = `${activeTermMonths} months (${(activeTermMonths / 12).toFixed(activeTermMonths % 12 === 0 ? 0 : 1)} yrs)`;
    if (elBreakdownTotal) elBreakdownTotal.textContent = `NZ$ ${(calc.totalPayable + deposit + tradein).toLocaleString('en-NZ')}`;
    if (elBreakdownInterest) elBreakdownInterest.textContent = `NZ$ ${calc.totalInterest.toLocaleString('en-NZ')}`;

    // Sync active state on preset chips ($10k / $15k / $20k / $35k / $50k)
    document.querySelectorAll('.preset-chip').forEach(chip => {
      const chipAmt = parseInt(chip.dataset.amount, 10);
      chip.classList.toggle('is-active', chipAmt === vehiclePrice);
    });

    // Sync active state on term pills (12 / 24 / 36 / 48 / 60)
    document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
      const pillMonths = parseInt(pill.dataset.termMonths || pill.dataset.term * 12, 10);
      pill.classList.toggle('is-active', pillMonths === activeTermMonths);
    });

    // Sync active state on frequency toggle buttons
    document.querySelectorAll('.freq-toggle-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.freq === activeFrequency);
    });

    // Dispatch update event for review summary in Step 4
    window.dispatchEvent(new CustomEvent('uniquecars:estimator-updated', {
      detail: {
        price: vehiclePrice,
        deposit,
        tradein,
        principal,
        termMonths: activeTermMonths,
        rate: activeRate,
        frequency: activeFrequency,
        repayment: calc.payment,
        totalPayable: calc.totalPayable
      }
    }));
  }

  // Frequency Toggle (Weekly / Fortnightly / Monthly)
  document.querySelectorAll('.freq-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const freq = btn.dataset.freq;
      if (freq && freq !== activeFrequency) {
        activeFrequency = freq;
        recalculate();
      }
    });
  });

  // Term Pills (12 / 24 / 36 / 48 / 60 mo)
  document.querySelectorAll('#term-pills .calc-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const months = parseInt(pill.dataset.termMonths || pill.dataset.term * 12, 10);
      if (!isNaN(months)) {
        activeTermMonths = months;
        if (termSelect) termSelect.value = months;
        recalculate();
      }
    });
  });

  // Preset Chips ($10k / $15k / $20k / $35k / $50k)
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

  // Slider & Amount Input binding
  amountSlider.addEventListener('input', recalculate);
  amountSlider.addEventListener('change', recalculate);

  if (amountInput) {
    amountInput.addEventListener('input', () => {
      const val = parseInt(amountInput.value, 10);
      if (!isNaN(val) && val >= 1000 && val <= 150000) {
        amountSlider.value = Math.min(100000, Math.max(5000, val));
        recalculate();
      }
    });
  }

  if (depositInput) {
    depositInput.addEventListener('input', recalculate);
  }

  if (tradeinInput) {
    tradeinInput.addEventListener('input', recalculate);
  }

  // Expandable Breakdown Accordion Toggle
  const breakdownToggle = document.getElementById('btn-toggle-breakdown');
  const breakdownPanel = document.getElementById('calc-breakdown-panel');
  if (breakdownToggle && breakdownPanel) {
    breakdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = breakdownPanel.classList.toggle('is-open');
      breakdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const arrow = breakdownToggle.querySelector('.toggle-arrow');
      if (arrow) arrow.textContent = isOpen ? '▴' : '▾';
    });
  }

  // Initial calculation
  recalculate();
}

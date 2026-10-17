/* ==========================================================================
   UNIQUE CARS (NZ) LTD — 4-STEP FINANCE APPLICATION FORM
   Step 1: Loan Details (Merged Calculator)
   Step 2: About You (Lead Auto-save on completion)
   Step 3: Living & Work Details
   Step 4: Review, Optional Documents & Privacy Act 2020 Consent
   Inline Validation · Green Ticks · Plain-English Errors · Success Screen
   ========================================================================== */

export function initApplyForm() {
  const form = document.getElementById('finance-enquiry-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 4;

  const stepEyebrow = document.getElementById('apply-step-eyebrow');
  const stepperItems = document.querySelectorAll('.stepper-step');
  const stepContents = document.querySelectorAll('.form-step-content');
  const btnPrev = document.getElementById('btn-form-prev');
  const btnNext = document.getElementById('btn-form-next');
  const btnSubmit = document.getElementById('btn-form-submit');
  const successCard = document.getElementById('form-success-card');
  const successName = document.getElementById('success-name');

  // Joint Application Toggle
  const jointToggle = document.getElementById('field-joint-toggle');
  const jointFieldsContainer = document.getElementById('joint-partner-fields');
  if (jointToggle && jointFieldsContainer) {
    jointToggle.addEventListener('change', () => {
      jointFieldsContainer.style.display = jointToggle.checked ? 'block' : 'none';
      const partnerInputs = jointFieldsContainer.querySelectorAll('input');
      partnerInputs.forEach(inp => {
        inp.required = jointToggle.checked;
      });
    });
  }

  // Credit Issues Toggle
  const creditIssueSelect = document.getElementById('field-credit-issues');
  const creditIssueDetailsWrap = document.getElementById('credit-issue-details-wrap');
  if (creditIssueSelect && creditIssueDetailsWrap) {
    creditIssueSelect.addEventListener('change', () => {
      creditIssueDetailsWrap.style.display = creditIssueSelect.value === 'yes' ? 'block' : 'none';
    });
  }

  // NZ Residency Toggle
  const residencySelect = document.getElementById('field-residency');
  const visaTypeWrap = document.getElementById('visa-type-wrap');
  if (residencySelect && visaTypeWrap) {
    residencySelect.addEventListener('change', () => {
      visaTypeWrap.style.display = residencySelect.value === 'no' ? 'block' : 'none';
    });
  }

  // Expandable Privacy Statement Toggle
  const privacyToggleBtn = document.getElementById('btn-toggle-privacy-statement');
  const privacyStatementPanel = document.getElementById('privacy-full-statement');
  if (privacyToggleBtn && privacyStatementPanel) {
    privacyToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = privacyStatementPanel.classList.toggle('is-open');
      privacyToggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const arrow = privacyToggleBtn.querySelector('.privacy-toggle-arrow');
      if (arrow) arrow.textContent = isExpanded ? '▴' : '▾';
    });
  }

  // DOB 3-Field UX Synchronization (Day, Month, Year -> hidden field)
  const dobDay = document.getElementById('dob-day');
  const dobMonth = document.getElementById('dob-month');
  const dobYear = document.getElementById('dob-year');
  const fieldDob = document.getElementById('field-dob');

  function syncDobToHidden() {
    if (!fieldDob) return;
    const d = dobDay ? dobDay.value.trim().padStart(2, '0') : '';
    const m = dobMonth ? dobMonth.value.trim().padStart(2, '0') : '';
    const y = dobYear ? dobYear.value.trim() : '';

    if (d && m && y && y.length === 4) {
      fieldDob.value = `${y}-${m}-${d}`;
    }
  }

  function syncHiddenToDobParts() {
    if (!fieldDob || !fieldDob.value) return;
    const parts = fieldDob.value.split('-');
    if (parts.length === 3) {
      if (dobYear) dobYear.value = parts[0];
      if (dobMonth) dobMonth.value = parts[1];
      if (dobDay) dobDay.value = parts[2];
    }
  }

  if (dobDay && dobMonth && dobYear) {
    [dobDay, dobMonth, dobYear].forEach(inp => {
      inp.addEventListener('input', () => {
        syncDobToHidden();
        if (fieldDob && fieldDob.value) {
          clearFieldError('field-dob');
        }
      });
      inp.addEventListener('keyup', (e) => {
        if (inp.id === 'dob-day' && inp.value.length === 2 && e.key >= '0' && e.key <= '9') {
          dobMonth.focus();
        } else if (inp.id === 'dob-month' && inp.value.length === 2 && e.key >= '0' && e.key <= '9') {
          dobYear.focus();
        }
      });
    });

    if (fieldDob && fieldDob.value) {
      syncHiddenToDobParts();
    }
  }

  // Address Autocomplete mock simulator (Fills suburb and city on Great South Road)
  const addressInput = document.getElementById('field-address');
  const suburbInput = document.getElementById('field-suburb');
  const cityInput = document.getElementById('field-city');
  if (addressInput) {
    addressInput.addEventListener('blur', () => {
      const val = addressInput.value.toLowerCase();
      if (val.includes('manurewa') || val.includes('great south')) {
        if (suburbInput && !suburbInput.value) suburbInput.value = 'Manurewa';
        if (cityInput && !cityInput.value) cityInput.value = 'Auckland';
      }
    });
  }

  // Lead auto-save on completion of Step 2
  function saveLeadToStorage() {
    try {
      const leadData = {
        firstName: document.getElementById('field-firstname')?.value.trim() || '',
        lastName: document.getElementById('field-lastname')?.value.trim() || '',
        mobile: document.getElementById('field-mobile')?.value.trim() || '',
        email: document.getElementById('field-email')?.value.trim() || '',
        amount: document.getElementById('field-price')?.value || '20000',
        term: document.getElementById('slider-term')?.value || '36',
        vehicleDesc: document.getElementById('field-vehicle-desc')?.value.trim() || '',
        savedAt: new Date().toISOString()
      };
      if (leadData.firstName || leadData.mobile) {
        localStorage.setItem('uniquecars_lead', JSON.stringify(leadData));
      }
    } catch (e) {
      // Storage unavailable or disabled
    }
  }

  // Populate dynamic review summary on Step 4
  function updateReviewSummary() {
    const firstName = document.getElementById('field-firstname')?.value.trim() || '';
    const lastName = document.getElementById('field-lastname')?.value.trim() || '';
    const mobile = document.getElementById('field-mobile')?.value.trim() || '';
    const email = document.getElementById('field-email')?.value.trim() || '';
    const vehicleDesc = document.getElementById('field-vehicle-desc')?.value.trim() || 'Any suitable vehicle';
    const price = document.getElementById('field-price')?.value || '20000';
    const deposit = document.getElementById('field-deposit')?.value || '0';
    const tradein = document.getElementById('field-tradein')?.value || '0';
    const termMonths = document.getElementById('slider-term')?.value || '36';
    const weeklyFig = document.getElementById('figure-weekly')?.textContent || 'NZ$ 239';
    const comfortable = document.getElementById('field-comfortable-pay')?.value || '';
    const comfortableFreq = document.getElementById('field-comfortable-freq')?.value || 'week';
    const living = document.getElementById('field-living')?.value || '';
    const address = document.getElementById('field-address')?.value || '';
    const employment = document.getElementById('field-employment')?.value || '';
    const employer = document.getElementById('field-employer')?.value || '';
    const income = document.getElementById('field-income')?.value || '';
    const incomeFreq = document.getElementById('field-income-freq')?.value || 'month';

    const netPrincipal = Math.max(1000, parseInt(price, 10) - parseInt(deposit || 0, 10) - parseInt(tradein || 0, 10));

    const revVehicle = document.getElementById('review-vehicle');
    const revLoan = document.getElementById('review-loan');
    const revApplicant = document.getElementById('review-applicant');
    const revLiving = document.getElementById('review-living');
    const revWork = document.getElementById('review-work');

    if (revVehicle) revVehicle.textContent = vehicleDesc;
    if (revLoan) {
      revLoan.textContent = `NZ$ ${netPrincipal.toLocaleString('en-NZ')} over ${termMonths} mo (~${weeklyFig}/wk)${comfortable ? ' • Budget: NZ$ ' + comfortable + '/' + comfortableFreq : ''}`;
    }
    if (revApplicant) {
      revApplicant.textContent = `${firstName} ${lastName} • ${mobile} • ${email}`;
    }
    if (revLiving) {
      revLiving.textContent = `${living ? living + ' — ' : ''}${address || 'Auckland'}`;
    }
    if (revWork) {
      revWork.textContent = `${employment}${employer ? ' at ' + employer : ''} • NZ$ ${income}/${incomeFreq}`;
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateNZPhone(phone) {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(02\d{7,9}|0[34679]\d{7}|0800\d{6,7}|\+64\d{8,10})$/.test(cleaned);
  }

  function validateAge18(dobString) {
    if (!dobString) return false;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }

  function setFieldError(fieldId, errorMsg) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const group = input.closest('.form-group') || input.closest('.checkbox-group');
    if (group) {
      group.classList.add('has-error');
      let errEl = group.querySelector('.form-error-msg');
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'form-error-msg';
        errEl.setAttribute('role', 'alert');
        group.appendChild(errEl);
      }
      errEl.textContent = errorMsg;
    }
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
  }

  function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const group = input.closest('.form-group') || input.closest('.checkbox-group');
    if (group) {
      group.classList.remove('has-error');
    }
    input.classList.remove('is-invalid');
    if (input.type !== 'checkbox' && input.value && input.value.trim()) {
      input.classList.add('is-valid');
    }
  }

  // Field validation rules
  const fieldValidationMap = [
    { id: 'field-price', validate: v => parseInt(v, 10) >= 1000, msg: 'Please enter a valid loan or vehicle price amount' },
    { id: 'field-firstname', msg: 'Please enter your first name' },
    { id: 'field-lastname', msg: 'Please enter your last name' },
    { id: 'field-mobile', validate: validateNZPhone, msg: 'Please enter a valid NZ mobile or phone number' },
    { id: 'field-email', validate: validateEmail, msg: 'Please enter a valid email address' },
    { id: 'field-dob', validate: validateAge18, msg: 'Applicants must be at least 18 years old' },
    { id: 'field-marital', msg: 'Please select your marital status' },
    { id: 'field-living', msg: 'Please select your living situation' },
    { id: 'field-address', msg: 'Please enter your current residential address' },
    { id: 'field-employment', msg: 'Please select your employment type' },
    { id: 'field-income', validate: v => parseInt(v, 10) > 0, msg: 'Please enter your take-home pay amount' }
  ];

  fieldValidationMap.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (!val) {
        setFieldError(item.id, item.msg);
      } else if (item.validate && !item.validate(val)) {
        setFieldError(item.id, item.msg);
      } else {
        clearFieldError(item.id);
      }
    });

    el.addEventListener('input', () => {
      if (el.classList.contains('is-invalid')) {
        const val = el.value.trim();
        if (val && (!item.validate || item.validate(val))) {
          clearFieldError(item.id);
        }
      }
    });
  });

  function validateStep(step) {
    let isValid = true;
    if (step === 1) {
      // Step 1: Loan Details
      const p = document.getElementById('field-price')?.value.trim();
      if (!p || parseInt(p, 10) < 1000) {
        setFieldError('field-price', 'Please enter a valid finance amount');
        isValid = false;
      } else {
        clearFieldError('field-price');
      }
    } else if (step === 2) {
      // Step 2: About You
      syncDobToHidden();
      const fields = ['field-firstname', 'field-lastname', 'field-mobile', 'field-email', 'field-dob', 'field-marital'];
      fields.forEach(fid => {
        const config = fieldValidationMap.find(c => c.id === fid);
        const el = document.getElementById(fid);
        const val = el?.value.trim();
        if (!val) {
          setFieldError(fid, config?.msg || 'This field is required');
          isValid = false;
        } else if (config?.validate && !config.validate(val)) {
          setFieldError(fid, config.msg);
          isValid = false;
        } else {
          clearFieldError(fid);
        }
      });

      // If valid, immediately auto-save partial lead!
      if (isValid) {
        saveLeadToStorage();
      }
    } else if (step === 3) {
      // Step 3: Living & Work
      const fields = ['field-living', 'field-address', 'field-employment', 'field-income'];
      fields.forEach(fid => {
        const config = fieldValidationMap.find(c => c.id === fid);
        const el = document.getElementById(fid);
        const val = el?.value.trim();
        if (!val) {
          setFieldError(fid, config?.msg || 'This field is required');
          isValid = false;
        } else if (config?.validate && !config.validate(val)) {
          setFieldError(fid, config.msg);
          isValid = false;
        } else {
          clearFieldError(fid);
        }
      });
    } else if (step === 4) {
      // Step 4: Review & Privacy Consent
      const privacyCheck = document.getElementById('field-privacy-consent');
      if (privacyCheck && !privacyCheck.checked) {
        setFieldError('field-privacy-consent', 'You must accept the Privacy Act 2020 authorisation to submit');
        isValid = false;
      } else {
        clearFieldError('field-privacy-consent');
      }
    }
    return isValid;
  }

  function goToStep(step, shouldScroll = false) {
    currentStep = step;

    if (stepEyebrow) {
      stepEyebrow.textContent = `STEP ${currentStep} OF ${totalSteps}`;
    }

    // Update stepper pills
    stepperItems.forEach(item => {
      const itemStep = parseInt(item.getAttribute('data-step'), 10);
      item.classList.remove('is-active', 'is-complete');
      item.removeAttribute('aria-current');

      if (itemStep === currentStep) {
        item.classList.add('is-active');
        item.setAttribute('aria-current', 'step');
      } else if (itemStep < currentStep) {
        item.classList.add('is-complete');
      }
    });

    // Update connector tracks
    document.querySelectorAll('.stepper-connector').forEach((conn, idx) => {
      if (idx + 1 < currentStep) {
        conn.classList.add('is-active');
      } else {
        conn.classList.remove('is-active');
      }
    });

    // Update progress bar
    const progressFill = document.getElementById('stepper-progress-fill');
    if (progressFill) {
      const pct = (currentStep / totalSteps) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Toggle step panes
    stepContents.forEach(pane => {
      const paneStep = parseInt(pane.getAttribute('data-step'), 10);
      if (paneStep === currentStep) {
        pane.classList.add('is-active');
      } else {
        pane.classList.remove('is-active');
      }
    });

    // Prev button state
    if (btnPrev) {
      btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
      if (currentStep === 2) btnPrev.textContent = '← Back to Loan Details';
      else if (currentStep === 3) btnPrev.textContent = '← Back to About You';
      else if (currentStep === 4) btnPrev.textContent = '← Back to Living & Work';
    }

    // Next / Submit button state
    if (currentStep === totalSteps) {
      if (btnNext) btnNext.style.display = 'none';
      if (btnSubmit) btnSubmit.style.display = 'inline-flex';
      updateReviewSummary();
    } else {
      if (btnNext) btnNext.style.display = 'inline-flex';
      if (btnSubmit) btnSubmit.style.display = 'none';
    }

    // Smooth scroll to top of form on mobile when user triggers step change
    if (shouldScroll && window.innerWidth <= 1024) {
      const formTop = form.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: formTop, behavior: 'smooth' });
    }
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1, true);
      }
    });
  }

  // Generic step forward alias buttons (e.g. for Step 2 and Step 3)
  document.querySelectorAll('.btn-form-step-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1, true);
      }
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        goToStep(currentStep - 1, true);
      }
    });
  }

  // Jump triggers for Review summary "Edit" links
  document.querySelectorAll('[data-goto-step]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetStep = parseInt(link.getAttribute('data-goto-step'), 10);
      if (!isNaN(targetStep) && targetStep >= 1 && targetStep <= totalSteps) {
        goToStep(targetStep, true);
      }
    });
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const firstName = document.getElementById('field-firstname')?.value.trim() || 'there';
    if (successName) successName.textContent = firstName;

    // Generate unique reference code
    const randCode = 'UC-' + Math.floor(10000 + Math.random() * 90000);
    const refEl = document.getElementById('success-ref-code');
    if (refEl) refEl.textContent = randCode;

    // Clear partial lead from localStorage on successful completion
    try {
      localStorage.removeItem('uniquecars_lead');
    } catch (e) {}

    // Hide form content and show success card
    form.style.display = 'none';
    if (successCard) {
      successCard.classList.add('is-active');
      successCard.focus();
      successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Sticky bottom bar mobile scroll listener
  const mobileBar = document.getElementById('mobile-sticky-bar');
  if (mobileBar) {
    window.addEventListener('scroll', () => {
      const formRect = form.getBoundingClientRect();
      const isPastForm = formRect.bottom < 0;
      mobileBar.classList.toggle('is-visible', isPastForm);
    }, { passive: true });
  }

  // Initialize on Step 1 without scrolling
  goToStep(1, false);
}

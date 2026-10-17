/* ==========================================================================
   UNIQUE CARS (NZ) LTD — 3-STEP FINANCE APPLICATION FORM
   Step 1: Vehicle & Calculator · Step 2: Personal Details · Step 3: Review & Submit
   Partial Lead Persistence · Inline Validation · 3-Field DOB UX · Success Screen
   ========================================================================== */

const VEHICLE_MODELS = {
  Toyota: ['Aqua Hybrid', 'Corolla', 'Prius', 'RAV4', 'Hilux', 'Vitz', 'Estima / Alphard', 'Land Cruiser Prado'],
  Subaru: ['Forester', 'Outback', 'Legacy', 'Impreza', 'XV', 'Levorg', 'Exiga'],
  Nissan: ['Leaf EV', 'Note e-Power', 'X-Trail', 'Serena', 'Tiida', 'Qashqai / Dualis', 'Navara'],
  Mazda: ['CX-5', 'Axela (Mazda3)', 'Demio (Mazda2)', 'Atenza (Mazda6)', 'CX-3', 'Biante'],
  Honda: ['Fit / Jazz', 'Vezel Hybrid', 'CR-V', 'Civic', 'Odyssey', 'Shuttle'],
  Mitsubishi: ['Outlander PHEV', 'Triton', 'ASX', 'Eclipse Cross', 'Delica D:5'],
  Suzuki: ['Swift', 'Jimny', 'Vitara', 'SX4 S-Cross'],
  Ford: ['Ranger', 'Everest', 'Focus', 'Transit'],
  European: ['BMW 3-Series / 5-Series / X3', 'Audi Q5 / A4', 'Mercedes-Benz C-Class / GLC', 'Volkswagen Golf / Tiguan'],
  Other: ['Sedan', 'Hatchback', 'SUV / 4X4', 'Station Wagon', 'Van / People Mover']
};

export function initApplyForm() {
  const form = document.getElementById('finance-enquiry-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 3;

  const stepEyebrow = document.getElementById('apply-step-eyebrow');
  const stepperItems = document.querySelectorAll('.stepper-step');
  const stepContents = document.querySelectorAll('.form-step-content');
  const btnPrev = document.getElementById('btn-form-prev');
  const btnNext = document.getElementById('btn-form-next');
  const btnSubmit = document.getElementById('btn-form-submit');
  const successCard = document.getElementById('form-success-card');
  const successName = document.getElementById('success-name');

  const makeSelect = document.getElementById('field-make');
  const modelSelect = document.getElementById('field-model');

  // Dynamic model population based on Make
  if (makeSelect && modelSelect) {
    makeSelect.addEventListener('change', () => {
      const selectedMake = makeSelect.value;
      modelSelect.innerHTML = '<option value="">Select model</option>';
      if (selectedMake && VEHICLE_MODELS[selectedMake]) {
        VEHICLE_MODELS[selectedMake].forEach(mod => {
          const opt = document.createElement('option');
          opt.value = mod;
          opt.textContent = mod;
          modelSelect.appendChild(opt);
        });
        modelSelect.disabled = false;
      } else {
        modelSelect.disabled = true;
      }
    });
  }

  // DOB 3-Field UX Sync with hidden/synced #field-dob
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

  // Partial lead auto-save to localStorage
  function savePartialLead() {
    try {
      const partialLead = {
        firstName: document.getElementById('field-firstname')?.value.trim() || '',
        lastName: document.getElementById('field-lastname')?.value.trim() || '',
        phone: document.getElementById('field-phone')?.value.trim() || '',
        email: document.getElementById('field-email')?.value.trim() || '',
        price: document.getElementById('field-price')?.value || '45000',
        make: document.getElementById('field-make')?.value || '',
        model: document.getElementById('field-model')?.value || '',
        updatedAt: new Date().toISOString()
      };
      if (partialLead.firstName || partialLead.phone) {
        localStorage.setItem('uniquecars_partial_lead', JSON.stringify(partialLead));
      }
    } catch (e) {
      // Storage unavailable or disabled
    }
  }

  ['field-firstname', 'field-lastname', 'field-phone', 'field-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', savePartialLead);
      el.addEventListener('change', savePartialLead);
    }
  });

  // Populate dynamic review summary on Step 3
  function updateReviewSummary() {
    const firstName = document.getElementById('field-firstname')?.value.trim() || '';
    const lastName = document.getElementById('field-lastname')?.value.trim() || '';
    const email = document.getElementById('field-email')?.value.trim() || '';
    const phone = document.getElementById('field-phone')?.value.trim() || '';
    const make = document.getElementById('field-make')?.value || 'Not specified';
    const model = document.getElementById('field-model')?.value || '';
    const year = document.getElementById('field-year')?.value || '';
    const price = document.getElementById('field-price')?.value || '45000';
    const term = document.getElementById('slider-term')?.value || '3';
    const weeklyFig = document.getElementById('figure-weekly')?.textContent || 'NZ$ 315';

    const reviewName = document.getElementById('review-name');
    const reviewPhone = document.getElementById('review-phone');
    const reviewVehicle = document.getElementById('review-vehicle');
    const reviewFinance = document.getElementById('review-finance');

    if (reviewName) reviewName.textContent = `${firstName} ${lastName}`.trim() || '—';
    if (reviewPhone) reviewPhone.textContent = `${phone} ${email ? '• ' + email : ''}`.trim() || '—';
    if (reviewVehicle) reviewVehicle.textContent = `${make} ${model} ${year ? '(' + year + ')' : ''}`.trim() || '—';
    if (reviewFinance) {
      reviewFinance.textContent = `NZ$ ${parseInt(price, 10).toLocaleString('en-NZ')} over ${term} ${parseInt(term, 10) === 1 ? 'Year' : 'Years'} (~${weeklyFig}/wk)`;
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

  // Inline blur validation configuration
  const inputsToValidate = [
    { id: 'field-make', msg: 'Please select a vehicle make' },
    { id: 'field-model', msg: 'Please select a vehicle model' },
    { id: 'field-year', msg: 'Please select vehicle year' },
    { id: 'field-price', validate: v => parseInt(v, 10) >= 5000 && parseInt(v, 10) <= 150000, msg: 'Amount must be between $5,000 and $150,000' },
    { id: 'field-firstname', msg: 'Please enter your first name' },
    { id: 'field-lastname', msg: 'Please enter your last name' },
    { id: 'field-email', validate: validateEmail, msg: 'Please enter a valid email address' },
    { id: 'field-phone', validate: validateNZPhone, msg: 'Please enter a valid NZ mobile or phone number' },
    { id: 'field-dob', validate: validateAge18, msg: 'Applicants must be at least 18 years old' },
    { id: 'field-residence', msg: 'Please select your residential status' },
    { id: 'field-employment', msg: 'Please select your employment status' },
    { id: 'field-income', validate: v => parseInt(v, 10) > 0, msg: 'Please enter your regular monthly income' },
    { id: 'field-credit', msg: 'Please select an estimated credit profile' }
  ];

  inputsToValidate.forEach(item => {
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
      // Step 1: Vehicle & Loan Details
      const fields = ['field-make', 'field-model', 'field-year', 'field-price'];
      fields.forEach(fid => {
        const config = inputsToValidate.find(c => c.id === fid);
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
    } else if (step === 2) {
      // Step 2: Personal Details
      syncDobToHidden();
      const fields = ['field-firstname', 'field-lastname', 'field-email', 'field-phone', 'field-dob', 'field-residence'];
      fields.forEach(fid => {
        const config = inputsToValidate.find(c => c.id === fid);
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
    } else if (step === 3) {
      // Step 3: Review & Submit
      const fields = ['field-employment', 'field-income', 'field-credit'];
      fields.forEach(fid => {
        const config = inputsToValidate.find(c => c.id === fid);
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

      const consentCheck = document.getElementById('field-consent');
      if (consentCheck && !consentCheck.checked) {
        setFieldError('field-consent', 'Please agree to the privacy policy, credit check consent, and CCCFA terms');
        isValid = false;
      } else {
        clearFieldError('field-consent');
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

    // Smooth scroll to top of form on mobile when transitioning between steps
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

  // Alias button for test compatibility
  const btnApplyEstimate = document.getElementById('btn-apply-estimate');
  if (btnApplyEstimate && btnApplyEstimate !== btnNext) {
    btnApplyEstimate.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1, true);
      }
    });
  }

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
      if (!isNaN(targetStep) && targetStep >= 1 && targetStep <= 3) {
        goToStep(targetStep, true);
      }
    });
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const firstName = document.getElementById('field-firstname')?.value.trim() || 'there';
    if (successName) successName.textContent = firstName;

    // Generate reference code
    const randCode = 'UC-' + Math.floor(10000 + Math.random() * 90000);
    const refEl = document.getElementById('success-ref-code');
    if (refEl) refEl.textContent = randCode;

    // Clear partial lead from localStorage on successful completion
    try {
      localStorage.removeItem('uniquecars_partial_lead');
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

  // Initialize on Step 1
  goToStep(1);
}

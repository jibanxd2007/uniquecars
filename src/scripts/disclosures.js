/* ==========================================================================
   UNIQUE CARS (NZ) LTD — DISCLOSURES & POLICIES CONTROLLER
   Official Lending Partners: Avanti Finance, Finance Now, Auto Finance Direct
   CCCFA Statutory Compliance · Responsible Lending Code
   ========================================================================== */

const DISCLOSURE_DATA = {
  'doc-1': {
    title: 'Avanti Finance — Standard Contract Terms',
    code: 'DOC-AVANTI-SCT-2026',
    date: 'February 2026',
    partner: 'Avanti Finance',
    link: 'https://www.avantifinance.co.nz/customer-documents/',
    summary: 'Unique Cars (NZ) Ltd is an accredited dealer partner for Avanti Finance. This document sets out standard consumer loan agreements, security interests taken over vehicles, and borrower covenants under New Zealand law.',
    keyPoints: [
      'Transparent personal and consumer vehicle loans with fixed interest rates over 1 to 7 year terms.',
      'Comprehensive security interest registered on the New Zealand Personal Property Securities Register (PPSR).',
      'Full documentation and pre-contract disclosure provided prior to vehicle delivery and loan execution.'
    ]
  },
  'doc-2': {
    title: 'Avanti Finance — Rates & Fee Schedule',
    code: 'DOC-AVANTI-RFS-2026',
    date: 'January 2026',
    partner: 'Avanti Finance',
    link: 'https://www.avantifinance.co.nz/rates-fees/#AL_fees',
    summary: 'Itemized fee schedule for vehicle loans arranged through Avanti Finance, including establishment fees, account maintenance, and default interest calculations.',
    keyPoints: [
      'Standard loan establishment fees clearly disclosed upfront with no hidden origination charges.',
      'Regular monthly account administration fees itemized on monthly repayment statements.',
      'Early repayment options available with calculations based strictly on statutory CCCFA guidelines.'
    ]
  },
  'doc-3': {
    title: 'Finance Now — Motor Vehicle Dealer Rates & Fees',
    code: 'DOC-FN-MVD-2026',
    date: 'February 2026',
    partner: 'Finance Now',
    link: 'https://www.financenow.co.nz/help/motor-vehicle-dealer-rates-and-fees/',
    summary: 'Standard interest rate tiers, dealer origination schedules, and loan management fees for vehicle financing through Finance Now.',
    keyPoints: [
      'Competitive tiered interest rates based on credit history and vehicle age.',
      'Instant pre-approval eligibility for qualifying applicants shopping at Unique Cars Ltd.',
      'Weekly, fortnightly, or monthly repayment frequency matching your income cycle.'
    ]
  },
  'doc-4': {
    title: 'Auto Finance Direct — Dealer/Consumer Credit (CCCFA)',
    code: 'DOC-AFD-CCCFA-2026',
    date: 'January 2026',
    partner: 'Auto Finance Direct',
    link: 'https://autofinancedirect.co.nz/dealer-consumer-information/',
    summary: 'Borrower statutory protections, responsible lending checks, and consumer rights under the Credit Contracts and Consumer Finance Act 2003.',
    keyPoints: [
      'Mandatory affordability assessments ensuring loan repayments fit comfortably within your regular income.',
      'Statutory 5-working-day right to cancel after receipt of initial disclosure.',
      'Unforeseen hardship relief procedures accessible in the event of unexpected illness, injury, or hardship.'
    ]
  },
  'doc-5': {
    title: 'Unique Cars — Mechanical Breakdown & Loan Insurance',
    code: 'DOC-UC-INS-2026',
    date: 'January 2026',
    partner: 'Unique Cars (NZ) Ltd',
    link: 'https://www.uniquecarsltd.co.nz/finance-information',
    summary: 'Comprehensive vehicle protection plans available through Unique Cars Ltd to safeguard your investment and peace of mind on Kiwi roads.',
    keyPoints: [
      '1, 2, or 3-year Mechanical Breakdown Insurance (MBI) policies covering major vehicle components.',
      'Payment Protection Insurance (PPI) and Guaranteed Asset Protection (GAP) options.',
      'All insurance products can be seamlessly incorporated into your vehicle loan package.'
    ]
  },
  'doc-6': {
    title: 'Unique Cars — Responsible Lending & RMVT Disclosures',
    code: 'DOC-UC-RLD-2026',
    date: 'February 2026',
    partner: 'Unique Cars (NZ) Ltd',
    link: 'https://www.uniquecarsltd.co.nz/about-us',
    summary: 'Unique Cars (NZ) Ltd company background (established in 1997), Registered Motor Vehicle Trader compliance, VTNZ/AA certification protocols, and dispute resolution details.',
    keyPoints: [
      'Registered Motor Vehicle Trader based at 327 Great South Road, Manurewa, Auckland.',
      '100% Certified Odometers and VTNZ/AA inspection certification on all imported vehicles.',
      'Adherence to the Motor Vehicle Disputes Tribunal (MVDT) and Financial Services Complaints procedures.'
    ]
  }
};

export function initDisclosures() {
  const modal = document.getElementById('disclosure-modal');
  const modalTitle = document.getElementById('modal-doc-title');
  const modalCode = document.getElementById('modal-doc-code');
  const modalDate = document.getElementById('modal-doc-date');
  const modalSummary = document.getElementById('modal-doc-summary');
  const modalList = document.getElementById('modal-doc-points');
  const modalLink = document.getElementById('modal-doc-link');
  const closeBtn = document.getElementById('btn-close-modal');
  const docRows = document.querySelectorAll('.doc-row');
  const viewAllBtn = document.getElementById('btn-view-all-resources');

  function openDoc(docId) {
    const data = DISCLOSURE_DATA[docId] || DISCLOSURE_DATA['doc-1'];
    if (!modal) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalCode) modalCode.textContent = data.code;
    if (modalDate) modalDate.textContent = `Provider: ${data.partner} · Updated: ${data.date}`;
    if (modalSummary) modalSummary.textContent = data.summary;

    if (modalList) {
      modalList.innerHTML = '';
      data.keyPoints.forEach(pt => {
        const li = document.createElement('li');
        li.textContent = pt;
        modalList.appendChild(li);
      });
    }

    if (modalLink) {
      modalLink.href = data.link;
      modalLink.textContent = `View Official ${data.partner} Disclosure Document →`;
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  docRows.forEach(row => {
    row.addEventListener('click', (e) => {
      e.preventDefault();
      const docId = row.getAttribute('data-doc-id');
      if (docId) openDoc(docId);
    });
  });

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openDoc('doc-1');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Interactive FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      if (!parent) return;
      const isOpen = parent.classList.contains('is-open');

      // Close other open faqs
      document.querySelectorAll('.faq-item.is-open').forEach(item => {
        if (item !== parent) {
          item.classList.remove('is-open');
          item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        parent.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        parent.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

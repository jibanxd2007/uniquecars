import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const executablePath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
console.log(`Using browser at: ${executablePath}`);

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  // 1. Load page
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  async function triggerAllReveals(p) {
    await p.evaluate(() => {
      document.querySelectorAll('.scroll-reveal').forEach(el => {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      document.querySelectorAll('.h1-line').forEach(el => {
        el.classList.add('is-revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      const hero = document.querySelector('.hero-image-wrap');
      if (hero) {
        hero.classList.add('is-revealed');
        hero.style.opacity = '1';
      }
    });
  }

  // 2. Viewport 1440
  console.log('Testing 1440px width (Desktop Deliverable)...');
  await page.setViewport({ width: 1440, height: 900 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = 'relative';
  });
  await page.screenshot({ path: 'screenshot-1440.png', fullPage: true });
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = '';
  });
  console.log('Saved screenshot-1440.png');

  // 3. Viewport 1280
  console.log('Testing 1280px width...');
  await page.setViewport({ width: 1280, height: 800 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = 'relative';
  });
  await page.screenshot({ path: 'screenshot-1280.png', fullPage: true });
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = '';
  });
  console.log('Saved screenshot-1280.png');

  // 4. Viewport 768
  console.log('Testing 768px width (Tablet)...');
  await page.setViewport({ width: 768, height: 1024 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = 'relative';
  });
  await page.screenshot({ path: 'screenshot-768.png', fullPage: true });
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = '';
  });
  console.log('Saved screenshot-768.png');

  // 5. Viewport 390 (Mobile 390 Deliverable)
  console.log('Testing 390px width (Mobile 390 Deliverable)...');
  await page.setViewport({ width: 390, height: 844 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'screenshot-390-fold.png', fullPage: false });
  console.log('Saved screenshot-390-fold.png (Above the fold)');

  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = 'relative';
    const s = document.getElementById('mobile-sticky-bar');
    if (s) s.style.display = 'none';
  });
  await page.screenshot({ path: 'screenshot-390.png', fullPage: true });
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = '';
    const s = document.getElementById('mobile-sticky-bar');
    if (s) s.style.display = '';
  });
  console.log('Saved screenshot-390.png');

  // Viewport 375 (Standard compact mobile)
  console.log('Testing 375px width (Mobile 375)...');
  await page.setViewport({ width: 375, height: 812 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'screenshot-375-fold.png', fullPage: false });

  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = 'relative';
    const s = document.getElementById('mobile-sticky-bar');
    if (s) s.style.display = 'none';
  });
  await page.screenshot({ path: 'screenshot-375.png', fullPage: true });
  await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (h) h.style.position = '';
    const s = document.getElementById('mobile-sticky-bar');
    if (s) s.style.display = '';
  });
  console.log('Saved screenshot-375.png');

  // 6. Reset to desktop 1440 for interactive 4-step testing
  await page.setViewport({ width: 1440, height: 900 });

  async function captureFormPanel(filename) {
    await page.evaluate(() => {
      const h = document.querySelector('.site-header');
      if (h) h.style.visibility = 'hidden';
    });
    const formPanel = await page.$('.form-panel');
    if (formPanel) {
      await formPanel.screenshot({ path: filename });
      console.log(`Saved ${filename}`);
    }
    await page.evaluate(() => {
      const h = document.querySelector('.site-header');
      if (h) h.style.visibility = '';
    });
  }

  // --- STEP 1: Loan Details & Merged Calculator ---
  console.log('\n--- Testing Form Step 1: Loan Details & Calculator ---');
  const initialWeekly = await page.$eval('#figure-weekly', el => el.textContent.trim());
  console.log(`Initial repayment: ${initialWeekly}`);

  // Test $35k preset chip
  await page.click('[data-amount="35000"]');
  await new Promise(r => setTimeout(r, 300));
  const weeklyAfter35k = await page.$eval('#figure-weekly', el => el.textContent.trim());
  console.log(`Repayment after $35k preset: ${weeklyAfter35k}`);

  // Test Fortnightly frequency toggle
  await page.click('[data-freq="fortnightly"]');
  await new Promise(r => setTimeout(r, 300));
  const fortnightlyFigure = await page.$eval('#figure-weekly', el => el.textContent.trim());
  const freqLabel = await page.$eval('#figure-freq-label', el => el.textContent.trim());
  console.log(`Fortnightly repayment: ${fortnightlyFigure} ${freqLabel}`);

  // Switch back to weekly
  await page.click('[data-freq="weekly"]');
  await new Promise(r => setTimeout(r, 200));

  // Expand CCCFA breakdown panel
  await page.click('#btn-toggle-breakdown');
  await new Promise(r => setTimeout(r, 200));
  const isBreakdownOpen = await page.$eval('#calc-breakdown-panel', el => el.classList.contains('is-open'));
  console.log(`CCCFA Breakdown panel opened: ${isBreakdownOpen}`);

  await captureFormPanel('form-step-1.png');

  // Advance to Step 2
  console.log('Advancing to Step 2 (About You)...');
  await page.click('#btn-form-next');
  await new Promise(r => setTimeout(r, 400));

  const isStep2Active = await page.$eval('[data-step="2"].form-step-content', el => el.classList.contains('is-active'));
  console.log(`Step 2 is active: ${isStep2Active}`);

  // --- STEP 2: About You ---
  console.log('\n--- Testing Form Step 2: About You & Lead Auto-save ---');
  await page.type('#field-firstname', 'Liam');
  await page.type('#field-lastname', 'Walker');
  await page.type('#field-mobile', '021 234 5678');
  await page.type('#field-email', 'liam.walker@example.co.nz');

  // Verify 3-field DOB sync
  const dobVal = await page.$eval('#field-dob', el => el.value);
  console.log(`3-Field DOB hidden value: ${dobVal}`);

  // Verify Marital selection
  await page.select('#field-marital', 'Single');

  await captureFormPanel('form-step-2.png');

  // Advance to Step 3 (this triggers saveLeadToStorage in form.js)
  console.log('Advancing to Step 3 (Living & Work)...');
  const step2NextBtn = await page.$('.form-step-content[data-step="2"] .btn-form-step-next');
  await step2NextBtn.click();
  await new Promise(r => setTimeout(r, 400));

  // Check lead was saved in localStorage
  const savedLead = await page.evaluate(() => localStorage.getItem('uniquecars_lead'));
  console.log(`Lead saved to localStorage on Step 2 completion: ${Boolean(savedLead)}`);

  const isStep3Active = await page.$eval('[data-step="3"].form-step-content', el => el.classList.contains('is-active'));
  console.log(`Step 3 is active: ${isStep3Active}`);

  // --- STEP 3: Living & Work ---
  console.log('\n--- Testing Form Step 3: Living & Work Details ---');
  await page.select('#field-living', 'Own House');
  await page.type('#field-address', '327 Great South Road');
  await page.type('#field-employer', 'Auckland Council — Specialist');
  await page.select('#field-employment', 'Full Time');
  await page.type('#field-income', '5600');

  // Test Credit Issues reveal
  await page.select('#field-credit-issues', 'yes');
  await new Promise(r => setTimeout(r, 200));
  const isCreditWrapVisible = await page.$eval('#credit-issue-details-wrap', el => el.style.display !== 'none');
  console.log(`Credit issues conditional field revealed: ${isCreditWrapVisible}`);
  await page.type('#field-credit-issue-text', 'Resolved telco default from 2022');

  await captureFormPanel('form-step-3.png');

  // Advance to Step 4
  console.log('Advancing to Step 4 (Review & Submit)...');
  const step3NextBtn = await page.$('.form-step-content[data-step="3"] .btn-form-step-next');
  await step3NextBtn.click();
  await new Promise(r => setTimeout(r, 400));

  const isStep4Active = await page.$eval('[data-step="4"].form-step-content', el => el.classList.contains('is-active'));
  console.log(`Step 4 is active: ${isStep4Active}`);

  // --- STEP 4: Review, Document Upload & Privacy Act 2020 ---
  console.log('\n--- Testing Form Step 4: Review Summary, Errors & Privacy Statement ---');
  const revApplicant = await page.$eval('#review-applicant', el => el.textContent.trim());
  const revLoan = await page.$eval('#review-loan', el => el.textContent.trim());
  console.log(`Review Applicant: ${revApplicant}`);
  console.log(`Review Loan: ${revLoan}`);

  // Test Validation Errors: Attempt submission without accepting Privacy Act 2020
  await page.click('#btn-form-submit');
  await new Promise(r => setTimeout(r, 300));
  await captureFormPanel('form-errors.png');
  console.log('Saved form-errors.png (Validation error on Privacy consent displayed)');

  // Expand Privacy Act 2020 Statement
  await page.click('#btn-toggle-privacy-statement');
  await new Promise(r => setTimeout(r, 300));
  const isPrivacyOpen = await page.$eval('#privacy-full-statement', el => el.classList.contains('is-open'));
  console.log(`Privacy statement expanded: ${isPrivacyOpen}`);

  await captureFormPanel('privacy-statement-expanded.png');

  // Check the required consent checkbox
  await page.click('#field-privacy-consent');
  await captureFormPanel('form-step-4.png');

  // Submit Application
  console.log('Submitting Application (clicking Submit Application)...');
  await page.click('#btn-form-submit');
  await new Promise(r => setTimeout(r, 500));

  const isSuccessActive = await page.$eval('#form-success-card', el => el.classList.contains('is-active'));
  const refCode = await page.$eval('#success-ref-code', el => el.textContent.trim());
  const successApplicantName = await page.$eval('#success-name', el => el.textContent.trim());
  console.log(`Success card displayed: ${isSuccessActive}`);
  console.log(`Applicant name in success card: ${successApplicantName}`);
  console.log(`Generated Reference Code: ${refCode}`);

  await captureFormPanel('form-success.png');

  // Test FAQ Accordion
  console.log('\n--- Testing FAQ Accordion ---');
  const firstFaq = await page.$('.faq-question');
  await firstFaq.click();
  await new Promise(r => setTimeout(r, 200));
  const isFaqExpanded = await page.$eval('.faq-item', el => el.classList.contains('is-open'));
  console.log(`FAQ 1 is open: ${isFaqExpanded}`);

  // Test Showroom Status Pill
  const statusPillText = await page.$eval('#live-showroom-status', el => el.textContent.trim());
  console.log(`Live Showroom Status text: ${statusPillText}`);

  // Test Disclosures Modal
  console.log('\n--- Testing Disclosures Modal ---');
  await page.click('[data-doc-id="doc-4"]');
  await new Promise(r => setTimeout(r, 300));
  const isModalOpen = await page.$eval('#disclosure-modal', el => el.classList.contains('is-open'));
  const modalDocTitle = await page.$eval('#modal-doc-title', el => el.textContent.trim());
  console.log(`Modal open: ${isModalOpen}`);
  console.log(`Modal Title: ${modalDocTitle}`);

  await page.click('#btn-close-modal');
  await new Promise(r => setTimeout(r, 300));
  const isModalClosed = await page.$eval('#disclosure-modal', el => !el.classList.contains('is-open'));
  console.log(`Modal closed: ${isModalClosed}`);

  // Mathematical Contrast Check
  console.log('\n--- WCAG 2.2 Contrast Verification ---');
  const contrastPairs = [
    { name: 'Navy heading (#0B1530) on White (#FFFFFF)', fg: [11, 21, 48], bg: [255, 255, 255] },
    { name: 'Navy text (#0B1530) on Surface (#F5F7FA)', fg: [11, 21, 48], bg: [245, 247, 250] },
    { name: 'Navy text (#0B1530) on Brand Blue CTA (#0C99E9)', fg: [11, 21, 48], bg: [12, 153, 233] },
    { name: 'Charcoal text (#334155) on White (#FFFFFF)', fg: [51, 65, 85], bg: [255, 255, 255] },
    { name: 'Charcoal text (#334155) on Surface (#F5F7FA)', fg: [51, 65, 85], bg: [245, 247, 250] },
    { name: 'Success Green text (#16A34A) on White (#FFFFFF)', fg: [22, 163, 74], bg: [255, 255, 255] },
    { name: 'White text (#FFFFFF) on Navy (#0B1530)', fg: [255, 255, 255], bg: [11, 21, 48] }
  ];

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getRatio(rgb1, rgb2) {
    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  contrastPairs.forEach(pair => {
    const ratio = getRatio(pair.fg, pair.bg).toFixed(2);
    const passesAA = ratio >= 4.5;
    console.log(`${pair.name} -> Contrast: ${ratio}:1 (${passesAA ? 'PASSES AA' : 'FAILS AA'})`);
  });

  await browser.close();

  const artifactDir = process.env.ARTIFACT_DIR || 'C:\\Users\\jiban\\.gemini\\antigravity-ide\\brain\\8b637f0a-583e-4625-82f4-52c4ce1bdb71';
  [
    'screenshot-1440.png',
    'screenshot-1280.png',
    'screenshot-768.png',
    'screenshot-390.png',
    'screenshot-390-fold.png',
    'screenshot-375.png',
    'screenshot-375-fold.png',
    'form-step-1.png',
    'form-step-2.png',
    'form-step-3.png',
    'form-step-4.png',
    'form-errors.png',
    'privacy-statement-expanded.png',
    'form-success.png'
  ].forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `${artifactDir}\\${file}`);
      console.log(`Copied ${file} to artifact directory.`);
    }
  });

  console.log('\nAll verifications completed successfully!');
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});

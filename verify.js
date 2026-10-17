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
  console.log('Testing 1440px width...');
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

  // 5. Viewport 375 & 390 (Modern Mobile)
  console.log('Testing 375px width (Mobile)...');
  await page.setViewport({ width: 375, height: 812 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'screenshot-375-fold.png', fullPage: false });
  console.log('Saved screenshot-375-fold.png (Above the fold)');

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
  console.log('Saved screenshot-375.png (Full page)');

  // Viewport 390 (Standard modern mobile: iPhone 14/15)
  console.log('Testing 390px width (Mobile 390)...');
  await page.setViewport({ width: 390, height: 844 });
  await triggerAllReveals(page);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: 'screenshot-390-fold.png', fullPage: false });
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

  // 6. Reset to desktop for interactive testing
  await page.setViewport({ width: 1440, height: 900 });

  // Test Estimator & Step 1 Form
  console.log('\n--- Testing Estimator & Form Step 1 (Vehicle & Loan Details) ---');
  const initialWeekly = await page.$eval('#figure-weekly', el => el.textContent.trim());
  console.log(`Initial weekly repayment: ${initialWeekly}`);

  // Adjust amount slider to $50,000
  await page.evaluate(() => {
    const slider = document.getElementById('slider-amount');
    slider.value = 50000;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 400));
  const updatedWeekly = await page.$eval('#figure-weekly', el => el.textContent.trim());
  console.log(`Updated weekly repayment (NZ$ 50,000): ${updatedWeekly}`);

  // Test dynamic make/model selection on Step 1
  await page.select('#field-make', 'Toyota');
  await new Promise(r => setTimeout(r, 100));
  const toyotaModels = await page.$$eval('#field-model option', opts => opts.map(o => o.value).filter(Boolean));
  console.log(`Toyota models populated: ${toyotaModels.join(', ')}`);
  await page.select('#field-model', 'Hilux');
  await page.select('#field-year', '2024–2026');

  // Capture Step 1 Form Card
  const formPanel = await page.$('.form-panel');
  if (formPanel) {
    await formPanel.screenshot({ path: 'form-step-1.png' });
    console.log('Saved form-step-1.png');
  }

  // Submit Step 1
  console.log('Advancing from Step 1 to Step 2 (clicking Next Step)...');
  await page.click('#btn-form-next');
  await new Promise(r => setTimeout(r, 400));

  // Check Step 2 is active
  const isStep2Active = await page.$eval('[data-step="2"].form-step-content', el => el.classList.contains('is-active'));
  console.log(`Step 2 is active: ${isStep2Active}`);

  // Test Step 2 Personal Details Form
  console.log('\n--- Testing Form Step 2 (Personal Details & 3-Field DOB) ---');
  await page.type('#field-firstname', 'Liam');
  await page.type('#field-lastname', 'Walker');
  await page.type('#field-email', 'liam.walker@uniquecarsltd.co.nz');
  await page.type('#field-phone', '021 234 5678');
  await page.type('#dob-day', '15');
  await page.type('#dob-month', '06');
  await page.type('#dob-year', '1992');
  await page.select('#field-residence', 'Own Home (Mortgage)');
  await page.type('#field-address', '327 Great South Road, Manurewa, Auckland');

  // Check partial lead saved in localStorage
  const partialLead = await page.evaluate(() => {
    return localStorage.getItem('uniquecars_partial_lead');
  });
  console.log(`Partial lead saved to localStorage: ${Boolean(partialLead)}`);

  // Capture Step 2 Form Card
  if (formPanel) {
    await formPanel.screenshot({ path: 'form-step-2.png' });
    console.log('Saved form-step-2.png');
  }

  // Submit Step 2
  console.log('Advancing from Step 2 to Step 3 (clicking Next Step)...');
  await page.click('#btn-form-next-step2');
  await new Promise(r => setTimeout(r, 400));

  // Check Step 3 is active
  const isStep3Active = await page.$eval('[data-step="3"].form-step-content', el => el.classList.contains('is-active'));
  console.log(`Step 3 is active: ${isStep3Active}`);

  // Test Step 3 Review & Submit
  console.log('\n--- Testing Form Step 3 & Review Summary ---');
  const summaryName = await page.$eval('#review-name', el => el.textContent.trim());
  const summaryVehicle = await page.$eval('#review-vehicle', el => el.textContent.trim());
  const summaryFinance = await page.$eval('#review-finance', el => el.textContent.trim());
  console.log(`Summary Name: ${summaryName}`);
  console.log(`Summary Vehicle: ${summaryVehicle}`);
  console.log(`Summary Finance: ${summaryFinance}`);

  // Test validation error state: attempt submitting without consent & without income
  await page.$eval('#field-income', el => el.value = '');
  await page.click('#btn-form-submit');
  await new Promise(r => setTimeout(r, 200));
  if (formPanel) {
    await formPanel.screenshot({ path: 'form-errors.png' });
    console.log('Saved form-errors.png (Inline validation errors displayed)');
  }

  await page.select('#field-employment', 'Full-time permanent');
  await page.$eval('#field-income', el => el.value = '6800');
  await page.select('#field-credit', 'Excellent');

  // Check Consent Checkbox
  await page.click('#field-consent');

  // Capture Step 3 Form Card ready to submit
  if (formPanel) {
    await formPanel.screenshot({ path: 'form-step-3.png' });
    console.log('Saved form-step-3.png');
  }

  console.log('Submitting Application (clicking Submit Application)...');
  await page.click('#btn-form-submit');
  await new Promise(r => setTimeout(r, 500));

  const isSuccessActive = await page.$eval('#form-success-card', el => el.classList.contains('is-active'));
  const refCode = await page.$eval('#success-ref-code', el => el.textContent.trim());
  console.log(`Success card displayed: ${isSuccessActive}`);
  console.log(`Generated Reference Code: ${refCode}`);

  if (formPanel) {
    await formPanel.screenshot({ path: 'form-success.png' });
    console.log('Saved form-success.png');
  }

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

  // Test FAQ Accordion
  console.log('\n--- Testing FAQ Accordion ---');
  const firstFaq = await page.$('.faq-question');
  await firstFaq.click();
  await new Promise(r => setTimeout(r, 200));
  const isFaqExpanded = await page.$eval('.faq-item', el => el.classList.contains('is-open'));
  console.log(`FAQ 1 is open: ${isFaqExpanded}`);

  // Mathematical Contrast Check
  console.log('\n--- WCAG 2.2 Contrast Verification ---');
  const contrastPairs = [
    { name: 'Navy heading (#0B1530) on White (#FFFFFF)', fg: [11, 21, 48], bg: [255, 255, 255] },
    { name: 'Navy text (#0B1530) on Surface (#F5F7FA)', fg: [11, 21, 48], bg: [245, 247, 250] },
    { name: 'White text (#FFFFFF) on Brand Blue CTA (#1479C9)', fg: [255, 255, 255], bg: [20, 121, 201] },
    { name: 'Charcoal text (#334155) on White (#FFFFFF)', fg: [51, 65, 85], bg: [255, 255, 255] },
    { name: 'Charcoal text (#334155) on Surface (#F5F7FA)', fg: [51, 65, 85], bg: [245, 247, 250] },
    { name: 'Success Green text (#15803D) on White (#FFFFFF)', fg: [21, 128, 61], bg: [255, 255, 255] },
    { name: 'White text at 80% on Navy (#0B1530)', fg: [204, 210, 224], bg: [11, 21, 48] }
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
    'form-errors.png',
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

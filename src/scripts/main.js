/* ==========================================================================
   VELOCITY FINANCE — APPLICATION ENTRY
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

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initEstimator();
  initApplyForm();
  initDisclosures();
  initMotion();
  initFooter();
});

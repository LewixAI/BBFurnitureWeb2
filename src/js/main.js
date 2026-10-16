import { initHeader } from './header.js';
import { initCart } from './cart.js';
import { initRails, initCards, initAccordions, initReveal, initImages, initSort, initNewsletter } from './ui.js';

const boot = () => {
  initHeader();
  initRails();
  initCards();
  initAccordions();
  initReveal();
  initImages();
  initSort();
  initNewsletter();
  initCart();
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

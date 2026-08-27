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

  // The assistant, in its own chunk, once the page has settled. It is the only
  // part of this site that needs a server, and the only part that costs money
  // per use — so it is fetched last, it draws nothing until the API says it is
  // switched on, and a build served without one behaves exactly as it did
  // before it existed. That matters more here than on the other site: this one
  // is on GitHub Pages, so the API is a different origin entirely and being
  // unreachable is an ordinary state.
  const loadChat = () => import('./chat.js').then(({ mountChat }) => mountChat()).catch(() => {});
  'requestIdleCallback' in window ? requestIdleCallback(loadChat, { timeout: 3000 }) : setTimeout(loadChat, 1200);
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

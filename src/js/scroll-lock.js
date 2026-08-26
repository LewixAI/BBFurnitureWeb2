/**
 * `body { overflow: hidden }` is not a scroll lock on iOS — the page keeps
 * scrolling behind the drawer and you come back somewhere else. Pinning the
 * body at its current offset is, and it restores the position on unlock.
 */
let locked = 0;
let saved = 0;

export function lock() {
  if (locked++) return;
  saved = window.scrollY;
  const bar = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${saved}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  if (bar > 0) document.body.style.paddingRight = `${bar}px`;
}

export function unlock() {
  if (!locked || --locked) return;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.paddingRight = '';
  window.scrollTo(0, saved);
}

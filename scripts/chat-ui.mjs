/**
 * Drives the assistant panel, at a desk and with a finger.
 *
 *   node scripts/chat-ui.mjs
 *
 * Headless Chrome rather than an MCP browser pane, for the reason the rest of
 * this repo already learned: those tabs are `visibilityState: hidden`, never
 * fire `requestAnimationFrame`, and throttle timers — and this widget is
 * loaded from a `requestIdleCallback`, polls on an interval, and scrolls its
 * own log. Every one of those would read as broken in a pane and work fine for
 * a visitor.
 *
 * Needs the site on :5191 and the chat API reachable, with the assistant
 * switched on in the back office.
 *
 * This site is served by GitHub Pages, so the widget calls the API
 * CROSS-ORIGIN — which makes two things checkable here that the proxied site
 * cannot check at all: that the API's CORS list names this origin, and that a
 * site with no proxy of ours in front of it is still served without the shared
 * secret it has no way to carry.
 */
import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL ?? 'http://localhost:5191';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

/// The widget is mounted from an idle callback after a network round trip, so
/// every case waits for it rather than sleeping a fixed amount and hoping.
///
/// The API's own answers are recorded alongside, because "the launcher did not
/// appear" is the same symptom for six different causes. This run opens four
/// sessions from one address, and a rate limit meant for a stranger in a loop
/// reads here as a broken widget — the failure has to name the 429.
function watchChat(page) {
  const seen = [];
  page.on('response', (res) => {
    if (res.url().includes('/api/chat/')) seen.push(`${res.request().method()} ${new URL(res.url()).pathname} → ${res.status()}`);
  });
  return seen;
}

const waitForLauncher = (page) => page.waitForSelector('bb-chat .chat__launcher', { timeout: 15000 });

// ── Desktop ────────────────────────────────────────────────────────────────

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  // Both observers go in before any of the page's own script runs: a shift
  // that happened before the observer existed is invisible, and the moment the
  // widget arrives cannot be recovered afterwards.
  await page.addInitScript(() => {
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shifts.push({ value: entry.value, at: entry.startTime });
    }).observe({ type: 'layout-shift', buffered: true });

    new MutationObserver((records, self) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeName === 'BB-CHAT') {
            window.__mountedAt = performance.now();
            self.disconnect();
          }
        }
      }
      // `document`, not `document.documentElement` — an init script runs
      // before the first document has a root element, and observing null
      // throws into the page's own console.
    }).observe(document, { childList: true, subtree: true });
  });

  const calls = watchChat(page);
  await page.goto(`${BASE}/`, { waitUntil: 'load' });

  console.log('\nDesktop');
  let appeared = true;
  await waitForLauncher(page).catch(() => { appeared = false; });
  check('the launcher appears once the API answers', appeared, calls.join('; '));

  // A widget that arrives after load is the classic source of a late layout
  // shift, which is why this one is fixed-position and appended to <body>
  // rather than inserted into the document flow.
  //
  // Measured as the shift AFTER it mounts, not the page's total. The homepage
  // already scores CLS 1.0 on its own — the hero image, at ~285ms, long before
  // the chat chunk is even requested — so a total would have failed this
  // whether the widget were blameless or catastrophic. That is the shape of a
  // check that looks strict and measures nothing: it was failing at 1.0001 with
  // the API blocked and the widget never mounted at all.
  await page.waitForTimeout(600);
  const late = await page.evaluate(() => {
    const from = window.__mountedAt ?? Infinity;
    return (window.__shifts ?? []).filter((s) => s.at >= from).reduce((n, s) => n + s.value, 0);
  });
  const total = await page.evaluate(() => (window.__shifts ?? []).reduce((n, s) => n + s.value, 0));
  check('mounting the widget shifts nothing', late < 0.01, `${late.toFixed(4)} after mount, page total ${total.toFixed(4)}`);

  check('the panel is closed until it is asked for', !(await page.locator('.chat__panel').count()));

  await page.click('.chat__launcher');
  await page.waitForSelector('.chat.is-open .chat__panel', { timeout: 5000 });
  check('clicking the launcher opens the panel', true);

  const greeting = await page.locator('.chat__bubble').first().innerText();
  check('the greeting comes from the server', greeting.length > 10, greeting.slice(0, 48));

  const chips = await page.locator('.chat__chip').count();
  check('suggested openers are offered', chips > 0, `${chips} chips`);

  // The real thing: click a suggestion and wait for an answer that is not the
  // greeting. This is the only case here that proves the API, the session, the
  // agent and the transcript all line up.
  await page.locator('.chat__chip').first().click();
  check('the visitor message appears immediately', (await page.locator('.chat__msg--visitor').count()) > 0);

  const answered = await page
    .waitForFunction(() => document.querySelectorAll('.chat__msg--assistant .chat__bubble').length >= 2, null, { timeout: 45000 })
    .then(() => true)
    .catch(() => false);
  check('a suggestion gets a real answer back', answered);

  if (answered) {
    const reply = await page.locator('.chat__msg--assistant .chat__bubble').last().innerText();
    check('the answer is not empty', reply.trim().length > 0, reply.slice(0, 60));
    // The web sanitiser strips emphasis; WhatsApp's converts it to a single
    // asterisk. Getting the two the wrong way round puts punctuation in a
    // browser, which is what the first live turn did.
    check('no markdown or WhatsApp bold reaches the page', !/[*_]{1,2}\S/.test(reply), reply.slice(0, 60));
    check('the visitor message is still there once the reply lands', (await page.locator('.chat__msg--visitor').count()) === 1, `${await page.locator('.chat__msg--visitor').count()} copies`);
  }

  // Cross-origin means the browser, not our code, is the thing that can refuse
  // this — and it refuses silently from the page's point of view. Worth its own
  // case, because "the launcher never appeared" is what a missing CORS entry
  // looks like from the outside.
  const blocked = errors.filter((e) => /CORS|Access-Control/i.test(e));
  check('nothing was blocked by CORS', blocked.length === 0, blocked[0] ?? '');

  // A long unbroken string is the usual way a chat bubble takes the page
  // sideways with it.
  await page.fill('.chat__input', 'x'.repeat(200));
  const bodyOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('a full composer does not widen the page', bodyOverflow <= 0, `${bodyOverflow}px`);

  const logScrolls = await page.locator('.chat__log').evaluate((e) => getComputedStyle(e).overflowY);
  check('the transcript scrolls inside the panel', logScrolls === 'auto' || logScrolls === 'scroll', logScrolls);

  await page.click('.chat__close');
  check('the close button closes it', !(await page.locator('.chat.is-open').count()));

  check('no console errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await page.close();
}

// ── Phone ──────────────────────────────────────────────────────────────────
//
// Real touch, no mouse. Every defect the site's mobile pass found was
// invisible to a screenshot and most were invisible to a click.

for (const width of [320, 360, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: 640 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const calls = watchChat(page);
  await page.goto(`${BASE}/`, { waitUntil: 'load' });

  console.log(`\nPhone ${width}px`);
  let appeared = true;
  await waitForLauncher(page).catch(() => { appeared = false; });
  check(`${width}: the launcher appears`, appeared, calls.join('; '));
  if (!appeared) { await context.close(); continue; }

  const launcher = await page.locator('.chat__launcher').boundingBox();
  check(`${width}: the launcher is a finger-sized target`, launcher.width >= 44 && launcher.height >= 44, `${launcher.width}×${launcher.height}`);

  const before = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${width}: the launcher does not widen the page`, before <= 0, `${before}px`);

  await page.tap('.chat__launcher');
  await page.waitForSelector('.chat.is-open .chat__panel', { timeout: 5000 });

  const after = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${width}: the open panel does not widen the page`, after <= 0, `${after}px`);

  // 16px or iOS Safari zooms in on focus and stays zoomed — with a full-screen
  // panel that leaves the send button off the edge of a magnified page.
  const fontSize = await page.locator('.chat__input').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  check(`${width}: the composer will not trigger the iOS zoom`, fontSize >= 16, `${fontSize}px`);

  const send = await page.locator('.chat__send').boundingBox();
  check(`${width}: send is a finger-sized target`, send.width >= 44 && send.height >= 44, `${send.width}×${send.height}`);

  // The close button has to be reachable without scrolling the transcript
  // back up — on a 320×568 screen the nav drawer once scrolled its own way
  // out of reach with no overlay to tap and no Escape key.
  const close = await page.locator('.chat__close').boundingBox();
  check(`${width}: close is on screen`, close.y >= 0 && close.y + close.height <= 640, `y=${Math.round(close.y)}`);

  // The page behind a full-screen sheet must be pinned. `body{overflow:hidden}`
  // is not a scroll lock here and never was.
  const pinned = await page.evaluate(() => getComputedStyle(document.body).position);
  check(`${width}: the page behind the sheet is pinned`, pinned === 'fixed', pinned);

  await page.tap('.chat__close');
  const released = await page.evaluate(() => getComputedStyle(document.body).position);
  check(`${width}: closing releases the page`, released !== 'fixed', released);

  await context.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);

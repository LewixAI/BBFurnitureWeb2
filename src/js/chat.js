/**
 * The assistant panel.
 *
 * Loaded on idle as its own chunk, and it draws nothing until the API says the
 * chat is switched on. That order matters: the launcher is the only thing a
 * visitor sees, and a launcher that opens onto "the chat is not available" is
 * worse than no launcher. The site is a static build served from nginx with no
 * backend of its own, so an unreachable API is an ordinary state — a fork on
 * GitHub Pages, a box being restarted, a deploy that has not run yet — and it
 * has to look like a site with no chat, not a broken one.
 *
 * Everything the panel says comes from the server. There is no local greeting,
 * no canned reply and no client-side fallback answer: the whole point of the
 * assistant is that its sentences are grounded in what the company actually
 * publishes, and a "helpful" default here would be the one line on the page
 * that nobody wrote.
 */
import '../styles/chat.css';
import { lock, unlock } from './scroll-lock.js';

/// Absolute, and cross-origin on purpose.
///
/// This site is served by GitHub Pages, so there is no nginx of ours to proxy
/// /api/chat/ through — the browser talks to the back office directly. Two
/// consequences that are easy to trip over: the API's CORS list has to name
/// this origin, and its CHAT_DIRECT_ORIGINS has to as well, because nothing
/// can inject the shared secret a proxied site carries.
const API = (import.meta.env?.VITE_CHAT_API || 'https://bigbrainsystem.lewix.ai/api/chat').replace(/\/$/, '');

/// `sessionStorage`, not `localStorage`. A shared or public machine is a real
/// case for a furniture showroom's website, and a chat transcript should not
/// outlive the tab it was typed in.
const STORE_KEY = 'bb-chat-session';

/// How often the panel looks for a reply written by a person in the back
/// office. Only while it is open — a closed panel polling in the background is
/// a request every few seconds from every tab anyone left open.
const POLL_MS = 8000;

const svg = {
  chat: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 5.5h17v11h-9l-5 4v-4h-3v-11z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="square"/></svg>',
};

/// Text goes in through `textContent`, never `innerHTML`.
///
/// The reply is written by a language model over documents, which makes it the
/// least trustworthy string on the page — not because the model is hostile,
/// but because anything that ever reaches the corpus reaches this node. Plain
/// text has no injection surface at all, which is also why the server strips
/// markdown rather than sending it: there is nothing here that would render it.
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

class BigBrainChat extends HTMLElement {
  connectedCallback() {
    this.seen = new Set();
    this.open = false;
    this.busy = false;
    this.status = 'BOT';
    this.build();
  }

  disconnectedCallback() {
    this.stopPolling();
  }

  build() {
    this.launcher = el('button', 'chat__launcher');
    this.launcher.type = 'button';
    this.launcher.setAttribute('aria-expanded', 'false');
    this.launcher.setAttribute('aria-label', `Ask ${this.dataset.brand || 'us'} a question`);
    this.launcher.innerHTML = svg.chat;
    this.launcher.addEventListener('click', () => this.toggle());
    this.append(this.launcher);
  }

  // ── The panel ────────────────────────────────────────────────────────────

  /// Built on first open, not on load. Most visitors never open it, and the
  /// panel is the larger half of the widget.
  ensurePanel() {
    if (this.panel) return;

    this.panel = el('div', 'chat__panel');
    this.panel.setAttribute('role', 'dialog');
    this.panel.setAttribute('aria-label', 'Chat with Big Brain');

    const head = el('div', 'chat__head');
    head.append(el('span', 'chat__title', this.dataset.brand || 'BIG BRAIN'));
    const close = el('button', 'chat__close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close chat');
    close.innerHTML = svg.close;
    close.addEventListener('click', () => this.toggle(false));
    head.append(close);

    this.log = el('div', 'chat__log');
    // Announced rather than silently appended: a reply arriving in a panel a
    // screen reader is not looking at is otherwise invisible.
    this.log.setAttribute('role', 'log');
    this.log.setAttribute('aria-live', 'polite');

    const form = el('form', 'chat__composer');
    this.input = el('input', 'chat__input');
    this.input.type = 'text';
    this.input.placeholder = 'Ask about a piece, a material, a showroom…';
    this.input.setAttribute('aria-label', 'Your message');
    this.input.autocomplete = 'off';
    // 1000 on the server. Matching it here means the refusal is a disabled
    // Send rather than a round trip that comes back rejected.
    this.input.maxLength = 1000;

    this.send = el('button', 'chat__send');
    this.send.type = 'submit';
    this.send.setAttribute('aria-label', 'Send');
    this.send.innerHTML = svg.send;

    form.append(this.input, this.send);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.say(this.input.value);
    });

    this.foot = el('div', 'chat__foot');
    this.panel.append(head, this.log, form, this.foot);
    this.append(this.panel);

    if (this.greeting) this.write({ id: 'greeting', from: 'assistant', text: this.greeting });
    this.renderSuggestions();
  }

  renderSuggestions() {
    if (!this.suggestions?.length) return;
    this.chips = el('div', 'chat__suggestions');
    for (const text of this.suggestions.slice(0, 3)) {
      const chip = el('button', 'chat__chip', text);
      chip.type = 'button';
      chip.addEventListener('click', () => this.say(text));
      this.chips.append(chip);
    }
    this.log.append(this.chips);
  }

  toggle(next = !this.open) {
    this.ensurePanel();
    this.open = next;
    this.classList.toggle('is-open', next);
    this.launcher.setAttribute('aria-expanded', String(next));

    // The panel is a full-height sheet on a phone, so the page behind it has
    // to be pinned — `overflow: hidden` on the body is not a scroll lock here,
    // as the site's own drawers already found out.
    if (this.fullscreen()) next ? lock() : unlock();

    if (next) {
      this.input.focus({ preventScroll: true });
      this.startPolling();
    } else {
      this.stopPolling();
      this.launcher.focus({ preventScroll: true });
    }
  }

  fullscreen() {
    return window.matchMedia('(max-width: 640px)').matches;
  }

  // ── Transcript ───────────────────────────────────────────────────────────

  write(message) {
    if (this.seen.has(message.id)) return;
    this.seen.add(message.id);

    const row = el('div', `chat__msg chat__msg--${message.from}`);
    row.append(el('p', 'chat__bubble', message.text));
    if (message.from === 'team') row.prepend(el('span', 'chat__who', 'Big Brain team'));
    this.log.append(row);
    this.scrollDown();
  }

  scrollDown() {
    // `scrollTop` rather than `scrollIntoView`: the latter scrolls the PAGE as
    // well when the panel is a fixed sheet, which drags the site out from
    // under the visitor while they read.
    this.log.scrollTop = this.log.scrollHeight;
  }

  /// Deliberately NOT a `chat__msg--assistant` row.
  ///
  /// It looked like one, and that made it indistinguishable from a real reply
  /// — to a screen reader, and to the harness, which watched for a second
  /// assistant bubble and found the dots. A placeholder that counts as an
  /// answer is a placeholder that can be mistaken for one.
  typing(on) {
    if (on && !this.dots) {
      this.dots = el('div', 'chat__typing');
      this.dots.append(el('p', 'chat__bubble chat__bubble--typing', '…'));
      this.log.append(this.dots);
      this.scrollDown();
    } else if (!on && this.dots) {
      this.dots.remove();
      this.dots = null;
    }
  }

  /// The visitor's own message, on screen the instant they send it.
  ///
  /// The transcript comes back from the server and contains their message
  /// already, so the obvious implementation is to wait and render what arrives
  /// — which means pressing Send empties the box and shows nothing for as long
  /// as the model takes. Several seconds of a chat that has visibly eaten what
  /// you typed. The echo is replaced by the server's copy, which is the one
  /// with a real id and a real timestamp.
  echo(text) {
    const row = el('div', 'chat__msg chat__msg--visitor');
    row.dataset.echo = '';
    row.append(el('p', 'chat__bubble', text));
    this.log.append(row);
    this.scrollDown();
  }

  clearEchoes() {
    for (const node of this.log.querySelectorAll('[data-echo]')) node.remove();
  }

  /// A failure the visitor can act on. Never dressed up as an answer — this is
  /// the one line on the page the assistant did not write, so it says what
  /// happened and offers the thing that always works.
  trouble(text) {
    const row = el('div', 'chat__notice');
    row.append(el('p', null, text));
    this.log.append(row);
    this.scrollDown();
    this.offerWhatsApp();
  }

  // ── Talking to the server ────────────────────────────────────────────────

  async say(raw) {
    const text = raw.trim();
    if (!text || this.busy) return;

    this.busy = true;
    this.input.value = '';
    this.setEnabled(false);

    // The openers go on the first message, whichever way it was sent. They
    // used to be removed only by the click that used one, so typing a question
    // instead left three suggestions sitting above the conversation for the
    // rest of it, still offering to start it.
    this.chips?.remove();
    this.chips = null;

    this.echo(text);
    this.typing(true);

    try {
      const res = await fetch(`${API}/message`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: this.session, text }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        // The session went away — a restart, or a tab left open for a week.
        // Get another one and let them send again rather than losing what
        // they typed into a dead-end error.
        sessionStorage.removeItem(STORE_KEY);
        this.typing(false);
        if (await this.startSession()) {
          this.busy = false;
          this.setEnabled(true);
          return this.say(text);
        }
      }

      this.typing(false);
      if (!res.ok) {
        // The echo stays: their message did not go anywhere, and removing it
        // would leave the notice below explaining a message that is no longer
        // on screen.
        this.trouble(body.error || 'That did not go through.');
        return;
      }

      this.clearEchoes();
      for (const message of body.messages) {
        // The cursor only ever advances on a message the SERVER issued. The
        // greeting is written client-side with an id of its own, and handing
        // that back as a cursor would ask the server to resume from a row that
        // does not exist.
        this.cursor = message.id;
        this.write(message);
      }
      this.status = body.status || 'BOT';
      if (this.status !== 'BOT') this.offerWhatsApp();
    } catch {
      this.typing(false);
      this.trouble('We could not reach the assistant just now.');
      /* The echo stays here too — see above. */
    } finally {
      this.busy = false;
      this.setEnabled(true);
      this.input.focus({ preventScroll: true });
    }
  }

  setEnabled(on) {
    this.input.disabled = !on;
    this.send.disabled = !on;
  }

  startPolling() {
    if (this.timer) return;
    this.timer = setInterval(() => this.poll(), POLL_MS);
  }

  stopPolling() {
    clearInterval(this.timer);
    this.timer = null;
  }

  async poll() {
    if (this.busy || !this.session || document.hidden) return;
    try {
      const query = new URLSearchParams({ sessionId: this.session });
      if (this.cursor) query.set('after', this.cursor);
      const res = await fetch(`${API}/messages?${query}`);
      if (!res.ok) return;
      const body = await res.json();
      for (const message of body.messages) {
        this.cursor = message.id;
        this.write(message);
      }
      this.status = body.status || this.status;
      if (this.status !== 'BOT') this.offerWhatsApp();
    } catch {
      // A poll that fails is a poll. The next one is eight seconds away and
      // the visitor is not waiting on it, so nothing is said.
    }
  }

  /// The exit that always works. Both showrooms take orders over WhatsApp and
  /// the site's own cart checks out there, so this is not a consolation prize
  /// — for anything that needs a person, it is the actual route.
  async offerWhatsApp() {
    if (this.foot.childElementCount) return;
    try {
      const res = await fetch(`${API}/handoff`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: this.session }),
      });
      if (!res.ok) return;
      const { url } = await res.json();
      const link = el('a', 'chat__whatsapp', 'Continue on WhatsApp');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      this.foot.append(link);
    } catch {
      /* Nothing to offer, and nothing worth saying about it. */
    }
  }

  async startSession() {
    const saved = sessionStorage.getItem(STORE_KEY);
    if (saved) {
      this.session = saved;
      return true;
    }
    try {
      const res = await fetch(`${API}/session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) return false;
      const body = await res.json();
      this.session = body.sessionId;
      sessionStorage.setItem(STORE_KEY, body.sessionId);
      return true;
    } catch {
      return false;
    }
  }
}

customElements.define('bb-chat', BigBrainChat);

/**
 * Puts the widget on the page — but only once the server has confirmed there
 * is a chat to open and has handed over a session.
 *
 * Both calls happen before anything is drawn, deliberately. A launcher that
 * appears and then fails on the first click is the worst of the three possible
 * outcomes, and it is the one that happens if the config check alone is used.
 */
export async function mountChat() {
  let config;
  try {
    const res = await fetch(`${API}/config`);
    if (!res.ok) return;
    config = await res.json();
  } catch {
    return;
  }

  const chat = document.createElement('bb-chat');
  chat.className = 'chat';
  if (config.brand) chat.dataset.brand = config.brand;
  // Set before the element is connected: appending runs connectedCallback, and
  // anything read during setup has to already be there.
  chat.greeting = config.greeting;
  chat.suggestions = config.suggestions;
  document.body.append(chat);

  if (!(await chat.startSession())) chat.remove();
}

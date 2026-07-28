/* ═══════════════════════════════════════════════════════════════════════
   COSMIC-OS — interaction layer
   Vanilla, no dependencies. Every effect degrades to a working page:
   nothing here is required to read the content.
   ═══════════════════════════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** True when the user is typing somewhere and shortcuts must stay out of the way. */
function isTyping(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/* ── TITLE CARD ──────────────────────────────────────────────────────
   Plays once per session on the first page. Two fades and out, ~2.2s,
   skippable with any key or click. No motion after it leaves. */

function titleCard() {
  const boot = $('#boot');
  if (!boot) return;

  // The head script already decided this session shouldn't play.
  if (root.classList.contains('booted')) {
    boot.remove();
    return;
  }

  const line = $('[data-boot-line]', boot);
  const mark = $('[data-boot-mark]', boot);
  let finished = false;
  const timers = [];

  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    try {
      sessionStorage.setItem('cosmic:booted', '1');
    } catch (e) {
      /* private mode — the card simply plays again */
    }
    boot.classList.add('done');
    root.classList.add('booted');
    window.removeEventListener('keydown', finish, true);
    window.removeEventListener('pointerdown', finish, true);
    setTimeout(() => boot.remove(), 460);
  };

  window.addEventListener('keydown', finish, true);
  window.addEventListener('pointerdown', finish, true);

  const show = (el, delay) => {
    if (!el) return;
    timers.push(
      setTimeout(() => {
        el.style.transition = 'opacity 700ms ease-out';
        el.style.opacity = '1';
      }, delay)
    );
  };

  show(line, 120);
  show(mark, 1100);
  timers.push(setTimeout(finish, 2600));
  // Fail-safe: never let a scripting error leave the overlay up.
  timers.push(setTimeout(finish, 5000));
}

/* ── MOBILE NAV ──────────────────────────────────────────────────────── */

function mobileNav() {
  const btn = $('[data-nav-toggle]');
  const menu = $('[data-nav-menu]');
  const label = $('[data-nav-label]');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
    if (label) label.textContent = open ? 'MENU' : 'CLOSE';
  });
}

/* ── STATUS LINE: CLOCK + SCROLL METER ───────────────────────────────── */

function statusLine() {
  const clock = $('[data-clock]');
  if (clock) {
    const tick = () => {
      clock.textContent = new Date().toISOString().slice(11, 19) + 'Z';
    };
    tick();
    setInterval(tick, 1000);
  }

  const meter = $('[data-scroll-meter]');
  const pct = $('[data-scroll-pct]');
  const bar = $('#progress');
  if (!meter && !pct && !bar) return;

  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const percent = Math.round(ratio * 100);
    if (bar) bar.style.width = percent + '%';
    if (pct) pct.textContent = percent + '%';
    if (meter) {
      const filled = Math.round(ratio * 10);
      meter.textContent = '█'.repeat(filled) + '░'.repeat(10 - filled);
    }
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ── TYPED TAGLINE ───────────────────────────────────────────────────── */

function typedText() {
  $$('[data-type]').forEach((host) => {
    const out = $('[data-type-out]', host);
    const text = host.getAttribute('data-type') || '';
    if (!out) return;

    if (reduceMotion) {
      out.textContent = text;
      return;
    }

    out.textContent = '';
    let i = 0;
    const delay = Math.max(18, Math.min(55, 1400 / Math.max(text.length, 1)));
    const step = () => {
      out.textContent = text.slice(0, i);
      if (i++ < text.length) setTimeout(step, delay);
    };
    setTimeout(step, 260);
  });
}

/* ── CURSOR-TRACKED WASH ─────────────────────────────────── */

function cursorPool() {
  if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
  let queued = false;
  let last = null;

  document.addEventListener(
    'pointermove',
    (e) => {
      const el = e.target instanceof Element ? e.target.closest('.pool') : null;
      if (!el) return;
      last = { el, x: e.clientX, y: e.clientY };
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (!last) return;
        const r = last.el.getBoundingClientRect();
        last.el.style.setProperty('--mx', last.x - r.left + 'px');
        last.el.style.setProperty('--my', last.y - r.top + 'px');
      });
    },
    { passive: true }
  );
}

/* ── SCROLL REVEAL ───────────────────────────────────────────────────── */

function scrollReveal() {
  const els = $$('[data-reveal]');
  if (!els.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach((el) => io.observe(el));
}

/* ── CODE COPY ───────────────────────────────────────────────────────── */

function codeCopy() {
  $$('.copy-btn').forEach((btn) => {
    btn.textContent = 'copy';
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const pre = btn.closest('pre');
      const code = pre && pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = 'copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'copy';
          btn.classList.remove('copied');
        }, 1800);
      } catch (err) {
        btn.textContent = 'failed';
        setTimeout(() => (btn.textContent = 'copy'), 1800);
      }
    });
  });
}

/* ── MODAL PLUMBING ──────────────────────────────────────────────────── */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function makeModal(el, { onOpen, onClose } = {}) {
  let restoreTo = null;

  const trap = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(FOCUSABLE, el).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };

  const api = {
    get isOpen() {
      return !el.hidden;
    },
    open() {
      if (!el.hidden) return;
      restoreTo = document.activeElement;
      el.hidden = false;
      document.body.classList.add('lightbox-open');
      el.addEventListener('keydown', trap);
      if (onOpen) onOpen();
    },
    close() {
      if (el.hidden) return;
      el.hidden = true;
      document.body.classList.remove('lightbox-open');
      el.removeEventListener('keydown', trap);
      if (onClose) onClose();
      if (restoreTo && restoreTo.focus) restoreTo.focus();
    },
    toggle() {
      api.isOpen ? api.close() : api.open();
    },
  };

  el.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-cmdk-backdrop') || e.target.hasAttribute('data-help-backdrop')) {
      api.close();
    }
  });

  return api;
}

/* ── COMMAND PALETTE ─────────────────────────────────────────────────── */

function readNavIndex() {
  const node = $('#nav-index');
  const empty = { pages: [], posts: [], tags: [], notes: [], extras: [] };
  if (!node) return empty;
  try {
    return Object.assign(empty, JSON.parse(node.textContent));
  } catch (e) {
    return empty;
  }
}

/** Subsequence match — cheap, forgiving, good enough for a few hundred rows. */
function fuzzyScore(needle, haystack) {
  if (!needle) return 1;
  const n = needle.toLowerCase();
  const h = haystack.toLowerCase();
  const direct = h.indexOf(n);
  if (direct === 0) return 1000;
  if (direct > 0) return 600 - direct;

  let score = 0;
  let hi = 0;
  let streak = 0;
  for (let ni = 0; ni < n.length; ni++) {
    const found = h.indexOf(n[ni], hi);
    if (found === -1) return 0;
    streak = found === hi ? streak + 1 : 0;
    score += 10 + streak * 4;
    hi = found + 1;
  }
  return score;
}

function commandPalette() {
  const el = $('#cmdk');
  if (!el) return null;

  const input = $('#cmdk-input', el);
  const list = $('#cmdk-list', el);
  const emptyMsg = $('[data-cmdk-empty]', el);
  const index = readNavIndex();

  const records = [
    ...index.pages.map((p) => ({ ...p, kind: 'page' })),
    ...index.posts.map((p) => ({ ...p, kind: 'post' })),
    ...index.tags.map((p) => ({ ...p, kind: 'tag' })),
    ...index.notes.map((p) => ({ ...p, kind: 'note' })),
    ...index.extras.map((p) => ({ ...p, kind: 'link' })),
  ];

  let results = [];
  let active = 0;

  const modal = makeModal(el, {
    onOpen() {
      input.value = '';
      render('');
      requestAnimationFrame(() => input.focus());
    },
  });

  function render(query) {
    results = records
      .map((r) => ({ r, s: Math.max(fuzzyScore(query, r.label), fuzzyScore(query, r.hint || '') * 0.4) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((x) => x.r);

    active = 0;
    list.innerHTML = '';
    emptyMsg.hidden = results.length > 0;

    results.forEach((r, i) => {
      const li = document.createElement('li');
      li.className =
        'cmdk-item flex cursor-pointer items-baseline gap-3 border-l-2 border-transparent px-4 py-2 font-mono text-sm transition-colors';
      li.setAttribute('role', 'option');
      li.id = 'cmdk-opt-' + i;
      li.setAttribute('aria-selected', String(i === 0));

      const kind = document.createElement('span');
      kind.className = 'w-10 shrink-0 font-mono text-[9px] uppercase tracking-widest text-ink-faint';
      kind.textContent = r.kind;

      const title = document.createElement('span');
      title.className = 'cmdk-title min-w-0 flex-1 truncate text-ink-hi';
      title.textContent = r.label;

      const hint = document.createElement('span');
      hint.className = 'hidden max-w-[45%] shrink-0 truncate text-[11px] text-ink-faint sm:block';
      hint.textContent = r.hint || r.url;

      li.append(kind, title, hint);
      li.addEventListener('click', () => go(i));
      li.addEventListener('pointermove', () => select(i));
      list.appendChild(li);
    });

    input.setAttribute('aria-activedescendant', results.length ? 'cmdk-opt-0' : '');
  }

  function select(i) {
    if (!results.length) return;
    active = (i + results.length) % results.length;
    $$('.cmdk-item', list).forEach((n, idx) => n.setAttribute('aria-selected', String(idx === active)));
    const node = list.children[active];
    if (node) node.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', 'cmdk-opt-' + active);
  }

  function go(i) {
    const r = results[i];
    if (!r) return;
    modal.close();
    window.location.href = r.url;
  }

  input.addEventListener('input', () => render(input.value.trim()));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      select(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      select(active - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(active);
    }
  });

  $$('[data-cmdk-open]').forEach((b) => b.addEventListener('click', () => modal.open()));

  // Show the right modifier for the platform.
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$('[data-cmdk-hint]').forEach((k) => (k.textContent = isMac ? '⌘K' : '^K'));

  return modal;
}

/* ── LIGHTBOX ────────────────────────────────────────────────────────── */

function lightbox() {
  const el = $('#lightbox');
  const items = $$('.photo-item');
  if (!el || !items.length) return null;

  const img = $('#lightbox-image', el);
  const caption = $('#lightbox-caption', el);
  const counter = $('[data-lightbox-counter]', el);
  const closeBtn = $('#lightbox-close', el);
  const prevBtn = $('#lightbox-prev', el);
  const nextBtn = $('#lightbox-next', el);

  // Largest candidate in a srcset. The viewer must not reuse the thumbnail's
  // currentSrc: that resolves against the grid's `sizes` (33vw), and while the
  // image is still lazy it is just the fallback `src` — either way a 300–600px
  // file blown up to 68vh. Prefer the webp <source>, fall back to the <img>.
  const widest = (srcset) => {
    const best = (srcset || '')
      .split(',')
      .map((c) => c.trim().split(/\s+/))
      .filter((c) => c[0])
      .reduce((a, c) => (parseInt(c[1], 10) || 0) > a.w ? { url: c[0], w: parseInt(c[1], 10) || 0 } : a,
        { url: '', w: 0 });
    return best.url;
  };

  const frames = items.map((item) => {
    const source = item.querySelector('.gallery-image');
    const webp = item.querySelector('source[type="image/webp"]');
    const cap = item.querySelector('.photo-caption');
    const full = webp && widest(webp.srcset);
    return {
      src: full || (source ? widest(source.srcset) || source.currentSrc || source.src : ''),
      alt: source ? source.alt : '',
      caption: cap ? cap.getAttribute('data-caption') || '' : '',
    };
  });

  let current = 0;

  const paint = () => {
    const f = frames[current];
    img.src = f.src;
    img.alt = f.alt;
    caption.textContent = f.caption;
    counter.textContent = current + 1 + '/' + frames.length;
  };

  const modal = makeModal(el, {
    onOpen() {
      paint();
      requestAnimationFrame(() => closeBtn.focus());
    },
  });

  const openAt = (i) => {
    current = i;
    modal.open();
  };
  const step = (d) => {
    current = (current + d + frames.length) % frames.length;
    paint();
  };

  items.forEach((item, i) => {
    item.addEventListener('click', () => openAt(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(i);
      }
    });
  });

  closeBtn.addEventListener('click', () => modal.close());
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  $('[data-lightbox-backdrop]', el).addEventListener('click', () => modal.close());

  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  return modal;
}

/* ── GLOBAL KEYMAP ───────────────────────────────────────────────────── */

function keymap({ cmdk, help, box }) {
  const gotoMap = {};
  readNavIndex().pages.forEach((p) => {
    if (p.key) gotoMap[p.key] = p.url;
  });

  let pendingG = 0;

  window.addEventListener('keydown', (e) => {
    // ⌘K / Ctrl+K works even inside fields.
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdk) cmdk.toggle();
      return;
    }

    if (e.key === 'Escape') {
      [cmdk, help, box].forEach((m) => m && m.isOpen && m.close());
      return;
    }

    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((cmdk && cmdk.isOpen) || (help && help.isOpen) || (box && box.isOpen)) return;

    // `g` then a destination key.
    if (Date.now() - pendingG < 1200 && gotoMap[e.key]) {
      pendingG = 0;
      window.location.href = gotoMap[e.key];
      return;
    }

    switch (e.key) {
      case 'g':
        pendingG = Date.now();
        break;
      case '/':
        e.preventDefault();
        if (cmdk) cmdk.open();
        break;
      case '?':
        e.preventDefault();
        if (help) help.toggle();
        break;
      case 'j':
        window.scrollBy({ top: 120, behavior: reduceMotion ? 'auto' : 'smooth' });
        break;
      case 'k':
        window.scrollBy({ top: -120, behavior: reduceMotion ? 'auto' : 'smooth' });
        break;
      default:
        break;
    }
  });
}

/* ── BOOT ────────────────────────────────────────────────────────────── */

function init() {
  mobileNav();
  statusLine();
  typedText();
  cursorPool();
  scrollReveal();
  codeCopy();

  const cmdk = commandPalette();
  const box = lightbox();

  const helpEl = $('#help');
  const help = helpEl ? makeModal(helpEl) : null;
  if (help) {
    $$('[data-help-open]').forEach((b) => b.addEventListener('click', () => help.toggle()));
    $$('[data-help-close]').forEach((b) => b.addEventListener('click', () => help.close()));
  }

  keymap({ cmdk, help, box });
  titleCard();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

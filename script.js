/* ============================================================
   HYDRACLIENT — MAIN SCRIPT  v4.0
   ============================================================ */

'use strict';

/* ── STATE ── */
let currentLang = CONFIG.defaultLanguage;

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  applyColors();
  buildLangDropdown();
  setLanguage(currentLang);   // внутри вызывает buildFeatures + buildPricing
  buildScreenshots();
  populateContact();
  setupNavScroll();
  setupReveal();
  setupCursorGlow();
  setupSmoothLinks();
  updateAuthUI();

  // Видео из конфига — показываем сразу без участия пользователя
  if (CONFIG.video.url) embedVideo(CONFIG.video.url);

  // Закрытие модалей по Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
});

/* ════════════════════════════════════════
   COLORS → CSS Variables
════════════════════════════════════════ */
function applyColors() {
  const c = CONFIG.colors;
  const s = document.documentElement.style;
  s.setProperty('--primary',       c.primary);
  s.setProperty('--primary-light', c.primaryLight);
  s.setProperty('--primary-dark',  c.primaryDark);
  s.setProperty('--secondary',     c.secondary);
  s.setProperty('--bg',            c.bg);
  s.setProperty('--bg-card',       c.bgCard);
  s.setProperty('--bg-card-hover', c.bgCardHover);
  s.setProperty('--text',          c.text);
  s.setProperty('--text-muted',    c.textMuted);
  s.setProperty('--border',        c.border);
  s.setProperty('--success',       c.success);
  s.setProperty('--glow',          c.glow);
}

/* ════════════════════════════════════════
   CURSOR GLOW
════════════════════════════════════════ */
function setupCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(hover: none)').matches) {
    if (glow) glow.style.display = 'none';
    return;
  }

  let mx = -9999, my = -9999;
  let cx = -9999, cy = -9999;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function tick() {
    cx += (mx - cx) * 0.07;
    cy += (my - cy) * 0.07;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(tick);
  })();
}

/* ════════════════════════════════════════
   NAVBAR SCROLL EFFECT
════════════════════════════════════════ */
function setupNavScroll() {
  const nav = document.getElementById('navbar');
  const toggle = () => nav.classList.toggle('scrolled', window.scrollY > 36);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/* ════════════════════════════════════════
   SMOOTH SCROLL LINKS
════════════════════════════════════════ */
function setupSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ════════════════════════════════════════
   REVEAL ON SCROLL (IntersectionObserver)
════════════════════════════════════════ */
let revealObs = null;

function setupReveal() {
  revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target); // наблюдаем только один раз
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

  observeRevealElements();
}

function observeRevealElements() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObs?.observe(el));
}

/* ════════════════════════════════════════
   LANGUAGE SYSTEM
════════════════════════════════════════ */
function buildLangDropdown() {
  const dropdown = document.getElementById('langDropdown');
  dropdown.innerHTML = CONFIG.languages.map(l => `
    <div class="lang-option ${l.code === currentLang ? 'active' : ''}" onclick="setLanguage('${l.code}')">
      <span class="lang-flag">${l.flag}</span>
      <span>${l.full}</span>
      <span class="lang-code-badge">${l.label}</span>
    </div>
  `).join('');
}

function toggleLangDropdown() {
  document.getElementById('langBtn').classList.toggle('open');
  document.getElementById('langDropdown').classList.toggle('open');
}

// Закрыть при клике вне
document.addEventListener('click', e => {
  const sel = document.getElementById('langSelector');
  if (sel && !sel.contains(e.target)) closeLangDropdown();
});

function closeLangDropdown() {
  document.getElementById('langBtn')?.classList.remove('open');
  document.getElementById('langDropdown')?.classList.remove('open');
}

function setLanguage(lang) {
  currentLang = lang;

  const t   = CONFIG.i18n[lang];
  const nav = CONFIG.nav.links[lang];
  const found = CONFIG.languages.find(l => l.code === lang);

  // Обновить кнопку языка
  document.getElementById('langLabel').textContent = found?.label ?? lang.toUpperCase();
  document.getElementById('langFlag').textContent  = found?.flag  ?? '';

  // Активный язык в дропдауне
  document.querySelectorAll('.lang-option').forEach((el, i) => {
    el.classList.toggle('active', CONFIG.languages[i]?.code === lang);
  });

  // Все элементы [data-i18n]
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (/^nav\d+$/.test(key)) {
      const idx = parseInt(key.slice(3));
      if (nav[idx] !== undefined) el.textContent = nav[idx];
    } else if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // Плейсхолдеры форм
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Мобильное меню
  document.querySelectorAll('[data-mob-i18n]').forEach(el => {
    const key = el.getAttribute('data-mob-i18n');
    if (/^nav\d+$/.test(key)) {
      const idx = parseInt(key.slice(3));
      if (nav[idx] !== undefined) el.textContent = nav[idx];
    } else if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // Hero
  const taglineEl = document.getElementById('heroTagline');
  const quoteEl   = document.getElementById('heroQuote');
  const hintEl    = document.getElementById('heroVideoHint');
  if (taglineEl) taglineEl.textContent = CONFIG.clientTagline[lang] ?? CONFIG.clientTagline.ru;
  if (quoteEl)   quoteEl.textContent   = CONFIG.heroQuote[lang]     ?? CONFIG.heroQuote.ru;
  if (hintEl)    hintEl.textContent    = CONFIG.video.placeholder[lang] ?? CONFIG.video.placeholder.ru;

  // Кнопки в hero
  const heroBtnBuy = document.getElementById('heroBtnBuy');
  if (heroBtnBuy) heroBtnBuy.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
    ${t.buyNowHero}
  `;
  const heroBtnLearn = document.getElementById('heroBtnLearn');
  if (heroBtnLearn) heroBtnLearn.textContent = t.learnMore;

  // Footer
  const footerTagline = document.getElementById('footerTagline');
  const footerCopy    = document.getElementById('footerCopy');
  if (footerTagline) footerTagline.textContent = CONFIG.clientTagline[lang] ?? CONFIG.clientTagline.ru;
  if (footerCopy)    footerCopy.textContent    = t.footerCopy;
  updateAuthUI();

  // Video section placeholder
  const vpt = document.getElementById('videoPlaceholderText');
  if (vpt) vpt.textContent = CONFIG.video.placeholder[lang] ?? CONFIG.video.placeholder.ru;

  // html lang attr
  document.documentElement.lang = lang;

  closeLangDropdown();

  // Перестроить динамические секции
  buildFeatures();
  buildPricing();
}

/* ════════════════════════════════════════
   FEATURES — иконки и карточки
════════════════════════════════════════ */
const FEATURE_ICONS = [
  // Красивый интерфейс
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M3 9h18M9 21V9"/>
  </svg>`,
  // Гибкая настройка
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>`,
  // Оптимизация
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>`,
  // Обновления
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23,4 23,10 17,10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>`,
  // Поддержка
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>`,
  // Обход античита
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9,12 11,14 15,10"/>
  </svg>`
];

function buildFeatures() {
  const grid  = document.getElementById('featuresGrid');
  const items = CONFIG.features[currentLang] ?? CONFIG.features.ru;

  grid.innerHTML = items.map((f, i) => `
    <div class="feature-card reveal reveal-d${(i % 6) + 1}">
      <div class="feature-icon-wrap">
        ${FEATURE_ICONS[i] ?? FEATURE_ICONS[0]}
      </div>
      <div class="feature-title">${f.title}</div>
      <div class="feature-desc">${f.desc}</div>
    </div>
  `).join('');

  observeRevealElements();
}

/* ════════════════════════════════════════
   SCREENSHOTS
════════════════════════════════════════ */
function buildScreenshots() {
  const grid  = document.getElementById('screenshotsGrid');
  const shots = CONFIG.screenshots;

  grid.innerHTML = shots.map((s, i) => `
    <div class="screenshot-item ${i === 0 ? 'screenshot-main' : ''} reveal reveal-d${i + 1}">
      <img
        src="${s.url}"
        alt="${s.alt}"
        loading="lazy"
        onerror="this.closest('.screenshot-item').style.display='none'"
      />
    </div>
  `).join('');

  observeRevealElements();
}

/* ════════════════════════════════════════
   PRICING
════════════════════════════════════════ */
function buildPricing() {
  const grid  = document.getElementById('pricingGrid');
  const t     = CONFIG.i18n[currentLang];
  const cur   = CONFIG.pricing.currency;
  const badge = CONFIG.pricing.badge[currentLang] ?? CONFIG.pricing.badge.ru;

  grid.innerHTML = CONFIG.pricing.plans.map((plan, i) => {
    const dur   = plan.duration[currentLang] ?? plan.duration.ru;
    const feats = plan.features[currentLang] ?? plan.features.ru;

    return `
      <div class="pricing-card ${plan.popular ? 'popular' : ''} reveal reveal-d${i + 1}">
        ${plan.popular ? `<div class="pricing-badge">${badge}</div>` : ''}
        <div class="pricing-duration">${dur}</div>
        <div class="pricing-price">
          <span class="currency">${cur}</span>${plan.price.toFixed(2)}
        </div>
        <div class="pricing-period">${t.perPeriod}</div>
        <ul class="pricing-features">
          ${feats.map(f => `
            <li>
              <span class="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </span>
              ${f}
            </li>
          `).join('')}
        </ul>
        <button
          class="btn ${plan.popular ? 'btn-primary' : 'btn-outline'}"
          style="width:100%;"
          onclick="handleBuy('${plan.id}', '${dur}', '${cur}${plan.price.toFixed(2)}')"
        >
          ${t.btnBuy}
        </button>
      </div>
    `;
  }).join('');

  observeRevealElements();
}

/* ════════════════════════════════════════
   ПОКУПКА — логика из config.js → payment
════════════════════════════════════════ */
function handleBuy(planId, duration, price) {
  const pay = CONFIG.payment;
  const t   = CONFIG.i18n[currentLang];

  // ── Вариант 1: Редирект на внешнюю страницу ──────────────
  if (pay.useRedirect) {
    const url = pay.redirectUrls?.[planId];
    if (url) {
      window.open(url, '_blank', 'noopener');
    } else {
      showToast('URL не задан в config.js → payment.redirectUrls', 'error');
    }
    return;
  }

  // ── Вариант 2: Попап с контактом для оплаты ──────────────
  if (pay.usePopup) {
    showPaymentPopup(planId, duration, price);
    return;
  }

  // ── Вариант 3: Кастомная логика (для разработчика) ────────
  // Пример: showToast(`${duration} — ${price}`, 'success');
  // Здесь можно подключить Stripe, LiqPay, WebMoney и т.д.
  showToast(`${duration} — ${price}`, 'success');
}

/* Попап оплаты (Вариант 2) */
function showPaymentPopup(planId, duration, price) {
  const t = CONFIG.i18n[currentLang];
  const link = CONFIG.payment.popupContact;

  const overlay = document.getElementById('modalPayment');
  const title   = document.getElementById('paymentPopupTitle');
  const body    = document.getElementById('paymentPopupBody');
  const linkEl  = document.getElementById('paymentPopupLink');

  if (!overlay) return;

  if (title) title.textContent = `${t.paymentPopupTitle} — ${duration} (${price})`;
  if (body)  body.textContent  = t.paymentPopupText;
  if (linkEl) linkEl.href = link;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ════════════════════════════════════════
   VIDEO EMBED (только через config.js)
   Пользователь сайта НЕ вводит ссылку —
   только владелец в CONFIG.video.url
════════════════════════════════════════ */
function embedVideo(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return;

  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white`;
  const iframe = `<iframe
    src="${src}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    loading="lazy"
    title="HydraClient — Gameplay"
  ></iframe>`;

  const heroFrame     = document.getElementById('heroVideoFrame');
  const sectionEmbed  = document.getElementById('videoContainer');
  if (heroFrame)    heroFrame.innerHTML    = iframe;
  if (sectionEmbed) sectionEmbed.innerHTML = iframe;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/* ════════════════════════════════════════
   CONTACTS
════════════════════════════════════════ */
function populateContact() {
  const { email, hours, discord, telegram } = CONFIG.contact;

  const emailCard = document.getElementById('supportEmailCard');
  if (emailCard) emailCard.href = `mailto:${email}`;

  const emailVal = document.getElementById('supportEmailVal');
  if (emailVal) emailVal.textContent = email;

  const hoursVal = document.getElementById('supportHoursVal');
  if (hoursVal) hoursVal.textContent = hours;

  const discordCard = document.getElementById('supportDiscordCard');
  if (discordCard) discordCard.href = discord;

  const tgCard = document.getElementById('supportTelegramCard');
  if (tgCard) tgCard.href = telegram;

  const footerDiscord  = document.getElementById('footerDiscord');
  const footerTelegram = document.getElementById('footerTelegram');
  if (footerDiscord)  footerDiscord.href  = discord;
  if (footerTelegram) footerTelegram.href = telegram;
}

/* ════════════════════════════════════════
   MOBILE MENU
════════════════════════════════════════ */
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

/* ════════════════════════════════════════
   LEGAL MODALS
════════════════════════════════════════ */
const MODAL_IDS = {
  privacy: 'modalPrivacy',
  terms:   'modalTerms',
  rules:   'modalRules',
  payment: 'modalPayment',
  auth:    'modalAuth',
  profile: 'modalProfile'
};

function openModal(key) {
  closeAllModals();
  const id = MODAL_IDS[key];
  if (!id) return;
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(key) {
  const id = MODAL_IDS[key];
  if (!id) return;
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

function closeAllModals() {
  Object.values(MODAL_IDS).forEach(id => {
    document.getElementById(id)?.classList.remove('open');
  });
  document.body.style.overflow = '';
}

function closeModalOutside(event, modalId) {
  if (event.target.id === modalId) {
    document.getElementById(modalId)?.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ════════════════════════════════════════
   TOAST NOTIFICATIONS
════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg, type = 'success') {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.className = `toast ${type} show`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}


/* ════════════════════════════════════════
   ACCOUNTS — локальное хранилище браузера
   Регистрация/вход прямо на сайте, без GitHub.
   Пароль хранится как PBKDF2-SHA256 хеш.
   ════════════════════════════════════════ */
const SESSION_KEY = 'hydraclient_session_v1';
const USERS_KEY   = 'hydraclient_users_v1';

function stableHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function uidForLogin(login) {
  return String((stableHash(login) % 900000) + 100000);
}

function hwidForDevice() {
  const raw = [
    navigator.userAgent || '',
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    (navigator.languages || [navigator.language]).join(',')
  ].join('|');
  const a = stableHash(raw).toString(16);
  const b = stableHash(raw.split('').reverse().join('')).toString(16);
  return (a + b + a + b + a).slice(0, 40);
}

function authText(key) {
  return CONFIG.i18n[currentLang]?.[key] ?? CONFIG.i18n.ru[key] ?? key;
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch (e) { return null; }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch (e) { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function usersApiUrl() {
  return (CONFIG.auth?.usersApi || '').replace(/\/$/, '');
}

const KEYS_KEY = 'hydraclient_keys_v1';
const REMOTE_TTL_MS = 15000;
let remoteCache = { at: 0, users: null, keys: null, inflight: null };

function loadKeys() {
  try { return JSON.parse(localStorage.getItem(KEYS_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveKeys(keys) {
  localStorage.setItem(KEYS_KEY, JSON.stringify(keys));
}

function normalizeRemoteData(data) {
  return {
    users: (data && data.users && typeof data.users === 'object') ? data.users : {},
    keys: (data && data.keys && typeof data.keys === 'object') ? data.keys : {}
  };
}

async function fetchRemoteData(force = false) {
  const url = usersApiUrl();
  if (!url) return { users: loadUsers(), keys: loadKeys() };
  const now = Date.now();
  if (!force && remoteCache.users && remoteCache.keys && (now - remoteCache.at) < REMOTE_TTL_MS) {
    return { users: remoteCache.users, keys: remoteCache.keys };
  }
  if (!force && remoteCache.inflight) return remoteCache.inflight;
  const req = (async () => {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('remote ' + res.status);
    const data = normalizeRemoteData(await res.json());
    remoteCache = { at: Date.now(), users: data.users, keys: data.keys, inflight: null };
    return data;
  })();
  if (!force) remoteCache.inflight = req;
  try { return await req; }
  finally { if (remoteCache.inflight === req) remoteCache.inflight = null; }
}

async function pushRemoteData(users, keys) {
  const url = usersApiUrl();
  if (!url) return;
  const payload = { users: users || {}, keys: keys || {} };
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  remoteCache = { at: Date.now(), users: payload.users, keys: payload.keys, inflight: null };
}

function mergeUsers(local, remote) {
  const merged = { ...local, ...remote };
  for (const login of Object.keys({ ...local, ...remote })) {
    const l = local[login];
    const r = remote[login];
    if (l && r) {
      const lu = new Date(l.updated_at || l.last_login || l.created_at || 0).getTime();
      const ru = new Date(r.updated_at || r.last_login || r.created_at || 0).getTime();
      merged[login] = ru >= lu ? r : l;
    } else {
      merged[login] = r || l;
    }
  }
  return merged;
}

async function syncUsersFromRemote(force = false) {
  const url = usersApiUrl();
  if (!url) return loadUsers();
  try {
    const data = await fetchRemoteData(force);
    const merged = mergeUsers(loadUsers(), data.users || {});
    const mergedKeys = { ...loadKeys(), ...(data.keys || {}) };
    saveUsers(merged);
    saveKeys(mergedKeys);
    remoteCache = { at: Date.now(), users: merged, keys: mergedKeys, inflight: null };
    return merged;
  } catch (e) {
    console.warn('Remote users sync failed', e);
    return loadUsers();
  }
}

async function pushUsersToRemote(users, keys = loadKeys()) {
  const url = usersApiUrl();
  if (!url) return;
  try {
    await pushRemoteData(users, keys);
  } catch (e) {
    console.warn('Remote users push failed', e);
  }
}

function pushRemoteDataAsync(users, keys) {
  return pushRemoteData(users, keys).catch(e => {
    console.warn('Remote push failed', e);
    showToast('Не удалось сохранить на сервере, повторите позже.', 'error');
  });
}

function currentAccount() {
  const session = getSession();
  if (!session?.login) return null;
  return { login: session.login, name: session.name || session.login };
}

function emailForLogin(login) {
  const domain = CONFIG.auth?.emailDomain || 'hydraclient.app';
  return `${login.toLowerCase()}@${domain}`;
}

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBuf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return { hash: bufToHex(bits), salt: bufToHex(salt) };
}

async function verifyPassword(password, saltHex, expectedHash) {
  const { hash } = await hashPassword(password, saltHex);
  return hash === expectedHash;
}

function setAuthStatus(message = '', type = 'info') {
  const el = document.getElementById('authStatus');
  if (!el) return;
  el.textContent = message;
  el.className = `auth-status ${message ? type : ''}`.trim();
}

function setAuthTab(mode) {
  const isRegister = mode === 'register';
  const regForm   = document.getElementById('authRegisterForm');
  const loginForm = document.getElementById('authLoginForm');
  const regTab    = document.getElementById('authTabRegister');
  const loginTab  = document.getElementById('authTabLogin');
  const title     = document.getElementById('authModalTitle');

  if (regForm)   regForm.hidden   = !isRegister;
  if (loginForm) loginForm.hidden = isRegister;
  regTab?.classList.toggle('active', isRegister);
  loginTab?.classList.toggle('active', !isRegister);
  if (title) title.textContent = authText(isRegister ? 'authTabRegister' : 'authTabLogin');
  setAuthStatus('');
}

function openAuth(mode = 'register') {
  closeAllModals();
  setAuthTab(mode);
  openModal('auth');
  const firstInput = document.getElementById(mode === 'register' ? 'authRegLogin' : 'authLoginInput');
  setTimeout(() => firstInput?.focus(), 60);
}

function handleNavLogin() {
  if (getSession()) openProfile();
  else openAuth('login');
}

function handleNavRegister() {
  if (getSession()) logoutAccount();
  else openAuth('register');
}

function updateAuthUI() {
  const acc = currentAccount();
  const loginBtn = document.getElementById('navLogin');
  const registerBtn = document.getElementById('navRegister');
  const mobLogin = document.getElementById('mobLogin');
  const mobRegister = document.getElementById('mobRegister');

  if (loginBtn) {
    loginBtn.textContent = acc ? acc.name : authText('navLogin');
    loginBtn.classList.toggle('is-user', !!acc);
    loginBtn.title = acc ? authText('accountPanel') : authText('navLogin');
  }
  if (registerBtn) {
    registerBtn.textContent = acc ? authText('authLogout') : authText('navRegister');
    registerBtn.classList.toggle('is-logout', !!acc);
  }
  if (mobLogin) {
    mobLogin.textContent = acc ? acc.name : authText('navLogin');
    mobLogin.classList.toggle('is-user', !!acc);
  }
  if (mobRegister) {
    mobRegister.textContent = acc ? authText('authLogout') : authText('navRegister');
  }
}

function readRegistrationForm() {
  return {
    login:    document.getElementById('authRegLogin')?.value.trim() ?? '',
    name:     document.getElementById('authRegName')?.value.trim() ?? '',
    password: document.getElementById('authRegPassword')?.value ?? '',
    confirm:  document.getElementById('authRegPassword2')?.value ?? ''
  };
}

function validateRegistration({ login, name, password, confirm }) {
  if (!/^[A-Za-z0-9_.-]{3,32}$/.test(login)) return 'authErrLoginFormat';
  if (name.length < 2 || name.length > 32) return 'authErrName';
  if (password.length < 8) return 'authErrPassword';
  if (password !== confirm) return 'authErrPasswordMismatch';
  return null;
}

function isAdminUser(userOrLogin) {
  const login = typeof userOrLogin === 'string' ? userOrLogin : (userOrLogin?.login || '');
  return login.toLowerCase() === 'owner' || userOrLogin?.role === 'admin';
}

function isBanned(user) {
  if (!user) return false;
  if (isAdminUser(user)) return false;
  const until = user.banned_until;
  if (!until) return false;
  if (String(until).toLowerCase() === 'perm') return true;
  const t = new Date(until).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function banText(user) {
  if (!isBanned(user)) return '';
  if (String(user.banned_until).toLowerCase() === 'perm') return 'навсегда';
  return formatDate(user.banned_until);
}

function buildSession(user) {
  return {
    login: user.login,
    name: user.name,
    email: emailForLogin(user.login),
    uid: user.uid || uidForLogin(user.login),
    created_at: user.created_at,
    last_login: user.last_login,
    hwid: user.hwid || hwidForDevice(),
    subscription_until: isAdminUser(user) ? 'lifetime' : (user.subscription_until || null),
    role: user.role || (isAdminUser(user) ? 'admin' : 'user'),
    banned_until: user.banned_until || null
  };
}

async function handleRegister(event) {
  event.preventDefault();
  const data = readRegistrationForm();
  const invalid = validateRegistration(data);
  if (invalid) return setAuthStatus(authText(invalid), 'error');

  const login = data.login.toLowerCase();
  const users = await syncUsersFromRemote();
  if (users[login]) return setAuthStatus(authText('authErrLoginTaken'), 'error');

  try {
    const { hash, salt } = await hashPassword(data.password);
    const nowIso = new Date().toISOString();
    users[login] = {
      login,
      name: data.name,
      passwordHash: hash,
      salt,
      uid: uidForLogin(login),
      created_at: nowIso,
      last_login: null,
      updated_at: nowIso,
      hwid: hwidForDevice(),
      subscription_until: null
    };
    saveUsers(users);
    remoteCache = { at: Date.now(), users, keys: loadKeys(), inflight: null };

    document.getElementById('authRegisterForm')?.reset();
    const loginInput = document.getElementById('authLoginInput');
    if (loginInput) loginInput.value = data.login;
    setAuthTab('login');
    setAuthStatus(authText('authSuccessRegistered'), 'success');
    showToast(authText('authSuccessRegistered'), 'success');
    pushRemoteDataAsync(users, loadKeys());
  } catch (err) {
    console.error(err);
    setAuthStatus(authText('authErrNetwork'), 'error');
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const loginRaw = document.getElementById('authLoginInput')?.value.trim() ?? '';
  const password = document.getElementById('authLoginPassword')?.value ?? '';
  const login = loginRaw.toLowerCase();

  if (!login || !password) return setAuthStatus(authText('authErrNotFound'), 'error');

  const users = await syncUsersFromRemote();
  const user = users[login];
  if (!user) return setAuthStatus(authText('authErrNotFound'), 'error');

  try {
    const ok = await verifyPassword(password, user.salt, user.passwordHash);
    if (!ok) return setAuthStatus(authText('authErrWrongPassword'), 'error');

    const banned = isBanned(user);
    if (isAdminUser(user)) user.subscription_until = 'lifetime';
    user.last_login = new Date().toISOString();
    user.updated_at = user.last_login;
    user.hwid = user.hwid || hwidForDevice();
    users[login] = user;
    saveUsers(users);
    saveSession(buildSession(user));
    updateAuthUI();
    remoteCache = { at: Date.now(), users, keys: loadKeys(), inflight: null };

    document.getElementById('authLoginForm')?.reset();
    if (banned) {
      setAuthStatus(`Аккаунт заблокирован до: ${banText(user)}`, 'error');
      showToast(`Аккаунт заблокирован до: ${banText(user)}`, 'error');
      setTimeout(() => { closeModal('auth'); openProfile(); }, 700);
    } else {
      setAuthStatus(`${authText('authWelcome')} ${user.name}`, 'success');
      showToast(authText('authSuccessLogin'), 'success');
      setTimeout(() => closeModal('auth'), 900);
    }
    pushRemoteDataAsync(users, loadKeys());
  } catch (err) {
    console.error(err);
    setAuthStatus(authText('authErrNetwork'), 'error');
  }
}

async function logoutAccount() {
  clearSession();
  updateAuthUI();
  showToast(authText('authSuccessLogout'), 'info');
  setAuthStatus(authText('authSuccessLogout'), 'info');
}

/* ════════════════════════════════════════
   PROFILE CAROUSEL
   ════════════════════════════════════════ */
let profileSlideIndex = 0;

function renderProfileCarousel() {
  const track = document.getElementById('profileCarouselTrack');
  const dots  = document.querySelectorAll('#profileCarouselDots button');
  const slides = track?.querySelectorAll('.carousel-slide') || [];
  if (!track || !slides.length) return;

  track.style.transform = `translateX(-${profileSlideIndex * 100}%)`;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === profileSlideIndex));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === profileSlideIndex));
}

function goToProfileSlide(index) {
  const track = document.getElementById('profileCarouselTrack');
  const total = track?.querySelectorAll('.carousel-slide').length || 0;
  if (!total) return;
  profileSlideIndex = ((index % total) + total) % total;
  renderProfileCarousel();
}

function slideProfile(direction) {
  goToProfileSlide(profileSlideIndex + direction);
}

/* ════════════════════════════════════════
   PROFILE — подписка и смена пароля
   ════════════════════════════════════════ */
function setProfileStatus(message = '', type = 'info') {
  const el = document.getElementById('profileStatus');
  if (!el) return;
  el.textContent = message;
  el.className = `auth-status ${message ? type : ''}`.trim();
}

function isLifetime(until) {
  return String(until || '').toLowerCase() === 'lifetime';
}

function isSubscriptionActive(until) {
  if (isLifetime(until)) return true;
  const t = new Date(until || 0).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function subscriptionText(until) {
  if (!until) return authText('profileNoSubscription');
  if (isLifetime(until)) return authText('profileLifetime');
  const diff = new Date(until).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return authText('profileExpired');
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  return `${authText('profileDaysLeft')} ${days}`.trim();
}

async function openProfile() {
  if (!getSession()) return openAuth('login');
  closeAllModals();
  openModal('profile');
  setProfileStatus('');
  syncSessionFromUser();
  renderAccountPanel();
}

function syncSessionFromUser() {
  const session = getSession();
  if (!session?.login) return;
  const users = loadUsers();
  const user = users[session.login];
  if (!user) return;
  saveSession(buildSession(user));
  updateAuthUI();
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'uk' ? 'uk-UA' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function accountGroup() {
  const s = getSession() || {};
  return isSubscriptionActive(s.subscription_until) ? authText('accountGroupPremium') : authText('accountGroupUser');
}

function renderAccountPanel() {
  const s = getSession();
  if (!s) return;
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || '—'; };

  set('profileName', s.name || s.login);
  set('profileLogin', `@${s.login}`);
  const avatar = document.getElementById('profileAvatar');
  if (avatar) avatar.textContent = (s.name || 'H').charAt(0).toUpperCase();

  const group = accountGroup();
  set('accountUid', s.uid || uidForLogin(s.login));
  set('accountGroup', group);
  set('accountRegDate', formatDate(s.created_at));
  set('accountLastLogin', formatDate(s.last_login));
  set('accountEmail', s.email || emailForLogin(s.login));
  set('accountHwid', s.hwid || hwidForDevice());
  set('accountPurchased', authText('accountProduct'));
  set('profileSubscriptionValue', subscriptionText(s.subscription_until));
  const badge = document.getElementById('accountGroupBadge');
  if (badge) badge.textContent = isAdminUser(s) ? 'Админ' : group;
  const adminPanel = document.getElementById('adminPanel');
  if (adminPanel) adminPanel.hidden = !isAdminUser(s);
  const banNotice = document.getElementById('profileBanNotice');
  if (banNotice) {
    const banned = isBanned(s);
    banNotice.hidden = !banned;
    banNotice.textContent = banned ? `Аккаунт заблокирован до: ${banText(s)}. Доступ в лаунчере и запуск игры ограничены.` : '';
  }
}

async function handleActivateKey(event) {
  event.preventDefault();
  const input = document.getElementById('accountKeyInput');
  const key = (input?.value || '').trim().toUpperCase();
  const session = getSession();
  if (!session) return openAuth('login');
  if (!key) return setProfileStatus(authText('accountKeyError'), 'error');

  let keyValue = CONFIG.activationKeys?.[key];
  const users = await syncUsersFromRemote();
  const keys = loadKeys();
  const dyn = keys[key];
  if (!keyValue && dyn) {
    if (dyn.used_by) return setProfileStatus('Этот ключ уже использован.', 'error');
    keyValue = dyn.duration;
  }
  if (!keyValue) return setProfileStatus(authText('accountKeyError'), 'error');

  const user = users[session.login];
  if (!user) return setProfileStatus(authText('authErrNotFound'), 'error');

  let msgDays = '';
  if (keyValue === 'lifetime' || keyValue === 'perm') {
    user.subscription_until = 'lifetime';
    msgDays = authText('profileLifetime');
  } else {
    const days = Number(keyValue) || 0;
    const base = isLifetime(user.subscription_until) ? Date.now() : Math.max(Date.now(), new Date(user.subscription_until || 0).getTime());
    user.subscription_until = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
    msgDays = `+${days} ${authText('profileDaysShort')}`;
  }
  user.activated_key = key;
  user.updated_at = new Date().toISOString();
  users[session.login] = user;
  if (dyn && !dyn.used_by) {
    dyn.used_by = session.login;
    dyn.used_at = new Date().toISOString();
    keys[key] = dyn;
    saveKeys(keys);
  }
  saveUsers(users);
  saveSession(buildSession(user));
  remoteCache = { at: Date.now(), users, keys, inflight: null };

  if (input) input.value = '';
  renderAccountPanel();
  setProfileStatus(`${authText('accountKeySuccess')} ${msgDays}`.trim(), 'success');
  showToast(authText('accountKeySuccess'), 'success');
  pushRemoteDataAsync(users, keys);
}

async function handleChangePassword(event) {
  event.preventDefault();
  const session = getSession();
  if (!session) return openAuth('login');

  const oldPassword = document.getElementById('profileOldPassword')?.value ?? '';
  const newPassword = document.getElementById('profileNewPassword')?.value ?? '';
  const confirm     = document.getElementById('profileConfirmPassword')?.value ?? '';

  if (newPassword.length < 8) return setProfileStatus(authText('authErrPassword'), 'error');
  if (newPassword !== confirm) return setProfileStatus(authText('authErrPasswordMismatch'), 'error');

  const users = await syncUsersFromRemote();
  const user = users[session.login];
  if (!user) return setProfileStatus(authText('authErrNotFound'), 'error');

  try {
    const ok = await verifyPassword(oldPassword, user.salt, user.passwordHash);
    if (!ok) return setProfileStatus(authText('profileErrOldPassword'), 'error');

    const { hash, salt } = await hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.updated_at = new Date().toISOString();
    users[session.login] = user;
    saveUsers(users);
    saveSession(buildSession(user));
    remoteCache = { at: Date.now(), users, keys: loadKeys(), inflight: null };

    document.getElementById('changePasswordForm')?.reset();
    setProfileStatus(authText('profileSuccessPassword'), 'success');
    showToast(authText('profileSuccessPassword'), 'success');
    pushRemoteDataAsync(users, loadKeys());
  } catch (err) {
    console.error(err);
    setProfileStatus(authText('authErrNetwork'), 'error');
  }
}


async function handleAdminBan(event) {
  event.preventDefault();
  const session = getSession();
  if (!session || !isAdminUser(session)) return setProfileStatus('Нет доступа.', 'error');
  const raw = (document.getElementById('adminBanInput')?.value || '').trim();
  if (!raw) return setProfileStatus('Введите: логин срок (например Player 13d)', 'error');
  const m = raw.match(/^(\S+)\s+(\d+)([dhm]|day|days|hour|hours|min|mins)?$/i) || raw.match(/^(\S+)\s+(perm|permanent)$/i);
  if (!m) return setProfileStatus('Формат: логин 13d / 5h / 30m / perm', 'error');
  const targetLogin = m[1].toLowerCase();
  if (targetLogin === 'owner') return setProfileStatus('Нельзя забанить OWNER.', 'error');

  const users = await syncUsersFromRemote();
  const target = users[targetLogin];
  if (!target) return setProfileStatus('Аккаунт не найден.', 'error');

  let until;
  if (String(m[2]).toLowerCase().startsWith('perm')) {
    until = 'perm';
  } else {
    const n = parseInt(m[2], 10);
    const unit = (m[3] || 'd').toLowerCase();
    const ms = unit.startsWith('h') ? n*3600000 : unit.startsWith('m') ? n*60000 : n*86400000;
    until = new Date(Date.now() + ms).toISOString();
  }
  target.banned_until = until;
  target.updated_at = new Date().toISOString();
  users[targetLogin] = target;
  saveUsers(users);
  remoteCache = { at: Date.now(), users, keys: loadKeys(), inflight: null };

  document.getElementById('adminBanInput').value = '';
  setProfileStatus(`Аккаунт ${targetLogin} заблокирован до: ${banText(target)}`, 'success');
  showToast('Игрок забанен', 'success');
  pushRemoteDataAsync(users, loadKeys());
}

async function handleAdminUnban(event) {
  event.preventDefault();
  const session = getSession();
  if (!session || !isAdminUser(session)) return setProfileStatus('Нет доступа.', 'error');
  const targetLogin = (document.getElementById('adminUnbanInput')?.value || '').trim().toLowerCase();
  if (!targetLogin) return setProfileStatus('Введите логин.', 'error');

  const users = await syncUsersFromRemote();
  const target = users[targetLogin];
  if (!target) return setProfileStatus('Аккаунт не найден.', 'error');
  target.banned_until = null;
  target.updated_at = new Date().toISOString();
  users[targetLogin] = target;
  saveUsers(users);
  remoteCache = { at: Date.now(), users, keys: loadKeys(), inflight: null };

  document.getElementById('adminUnbanInput').value = '';
  setProfileStatus(`Аккаунт ${targetLogin} разбанен.`, 'success');
  showToast('Игрок разбанен', 'success');
  pushRemoteDataAsync(users, loadKeys());
}

async function handleAdminResetPassword(event) {
  event.preventDefault();
  const session = getSession();
  if (!session || !isAdminUser(session)) return setProfileStatus('Нет доступа.', 'error');
  const targetLogin = (document.getElementById('adminResetLogin')?.value || '').trim().toLowerCase();
  const newPassword = document.getElementById('adminResetPassword')?.value || '';
  if (!targetLogin) return setProfileStatus('Введите логин.', 'error');
  if (newPassword.length < 6) return setProfileStatus('Пароль: минимум 6 символов.', 'error');

  const users = await syncUsersFromRemote();
  const target = users[targetLogin];
  if (!target) return setProfileStatus('Аккаунт не найден.', 'error');
  try {
    const { hash, salt } = await hashPassword(newPassword);
    target.passwordHash = hash;
    target.salt = salt;
    target.updated_at = new Date().toISOString();
    users[targetLogin] = target;
    saveUsers(users);
    remoteCache = { at: Date.now(), users, keys: loadKeys(), inflight: null };

    document.getElementById('adminResetLogin').value = '';
    document.getElementById('adminResetPassword').value = '';
    setProfileStatus(`Пароль для ${targetLogin} сброшен.`, 'success');
    showToast('Пароль сброшен', 'success');
    pushRemoteDataAsync(users, loadKeys());
  } catch (e) {
    console.error(e);
    setProfileStatus('Ошибка сброса пароля.', 'error');
  }
}


function parseKeyDuration(key) {
  const m = String(key).trim().match(/(?:^|[^a-z0-9])(\d+)(d|h|m)$/i);
  if (m) return { duration: parseInt(m[1],10), unit: m[2].toLowerCase() };
  if (/(?:^|[^a-z0-9])(perm|lifetime|forever)$/i.test(key)) return { duration: 'lifetime', unit: 'lifetime' };
  return null;
}

async function handleAdminCreateKey(event) {
  event.preventDefault();
  const session = getSession();
  if (!session || !isAdminUser(session)) return setProfileStatus('Нет доступа.', 'error');
  const raw = (document.getElementById('adminKeyInput')?.value || '').trim();
  if (!raw) return setProfileStatus('Введите ключ.', 'error');
  const key = raw.toUpperCase();
  const parsed = parseKeyDuration(key);
  if (!parsed) return setProfileStatus('В конце ключа укажите срок: 13d, 12h, 30m или perm.', 'error');
  if (CONFIG.activationKeys?.[key]) return setProfileStatus('Такой ключ уже существует.', 'error');

  const users = await syncUsersFromRemote();
  const keys = loadKeys();
  if (keys[key]) return setProfileStatus('Такой ключ уже существует.', 'error');

  let duration;
  let label;
  if (parsed.duration === 'lifetime') { duration = 'lifetime'; label = 'навсегда'; }
  else if (parsed.unit === 'h') { duration = Math.max(1, parsed.duration) / 24; label = `${parsed.duration} ч.`; }
  else if (parsed.unit === 'm') { duration = Math.max(1, parsed.duration) / 1440; label = `${parsed.duration} мин.`; }
  else { duration = Math.max(1, parsed.duration); label = `${parsed.duration} дн.`; }
  if (duration !== 'lifetime') duration = Number(duration);

  keys[key] = { duration, label, created_by: session.login, created_at: new Date().toISOString(), used_by: null, used_at: null };
  saveKeys(keys);
  saveUsers(users);
  remoteCache = { at: Date.now(), users, keys, inflight: null };

  document.getElementById('adminKeyInput').value = '';
  setProfileStatus(`Ключ создан: ${key} (${label})`, 'success');
  showToast('Ключ создан', 'success');
  pushRemoteDataAsync(users, keys);
}

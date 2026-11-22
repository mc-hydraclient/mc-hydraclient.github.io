/*
 * HydraClient — главное меню / демо-логика оформления.
 *
 * ЧТО НУЖНО ЗАМЕНИТЬ ПЕРЕД ПРОДАЖЕЙ:
 * 1. PAYMENT_URLS — реальные ссылки на оплату (YooKassa, Payhip, Gumroad и т.д.).
 * 2. SUPPORT_URL — ссылка на Telegram/поддержку.
 * 3. В index.html — цены, условия возврата, название и реквизиты продавца.
 * 4. DELIVERY_NOTE — сообщение, которое увидит покупатель после оплаты.
 *
 * Важно: это демо. Настоящую выдачу ключа и файла делает сервер после
 * подтверждения платежа, а не браузерный JavaScript.
 */
const PAYMENT_URLS = {
  standard: '', // например: 'https://payhip.com/b/XXXX'
  pro: '',
  lifetime: ''
};

const SUPPORT_URL = ''; // например: 'https://t.me/your_support'
const DELIVERY_NOTE = 'Демо-режим: платёж ещё не подключён.';

/* ---------- Мобильное меню ---------- */
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

navToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Модальное окно заказа ---------- */
const dialog = document.getElementById('order-dialog');
const form = document.getElementById('order-form');
const planSelect = document.getElementById('plan-select');
const emailInput = document.getElementById('email');
const statusEl = document.getElementById('dialog-status');
const payButton = document.getElementById('pay-button');

function openOrder(plan) {
  if (plan && PAYMENT_URLS[plan]) planSelect.value = plan;
  statusEl.textContent = '';
  statusEl.classList.remove('error');
  dialog.showModal();
  emailInput.focus();
}

document.querySelectorAll('.buy-trigger').forEach((button) => {
  button.addEventListener('click', () => openOrder(button.dataset.plan));
});

document.getElementById('dialog-close')?.addEventListener('click', () => dialog.close());

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!emailInput.checkValidity() || !email) {
    statusEl.textContent = 'Введи корректный e-mail.';
    statusEl.classList.add('error');
    emailInput.focus();
    return;
  }

  const plan = planSelect.value;
  const paymentUrl = PAYMENT_URLS[plan];

  if (!paymentUrl) {
    statusEl.textContent = DELIVERY_NOTE;
    statusEl.classList.add('error');
    return;
  }

  // Передаём e-mail и тариф платёжной странице, чтобы потом привязать заказ.
  const url = new URL(paymentUrl, window.location.href);
  url.searchParams.set('email', email);
  url.searchParams.set('plan', plan);
  window.location.assign(url.toString());
});

/* ---------- Прочее ---------- */
document.getElementById('year').textContent = String(new Date().getFullYear());

if (SUPPORT_URL) {
  document.querySelectorAll('[data-support-link]').forEach((link) => {
    link.href = SUPPORT_URL;
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

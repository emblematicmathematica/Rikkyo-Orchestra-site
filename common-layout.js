const pageKey = document.body.dataset.page || 'home';

const sharedNav = {
  home: [
    { href: '#about', label: '楽団紹介' },
    { href: 'history.html', label: '歴史' },
    { href: 'concerts.html', label: '演奏会情報' },
    { href: 'join.html', label: '新入生の方へ' },
    { href: 'news.html', label: '新着情報' },
    { href: '#contact', label: 'お問い合わせ' },
  ],
  sub: [
    { href: 'index.html#about', label: '楽団紹介' },
    { href: 'history.html', label: '歴史', key: 'history' },
    { href: 'concerts.html', label: '演奏会情報', key: 'concerts' },
    { href: 'join.html', label: '新入生の方へ', key: 'join' },
    { href: 'news.html', label: '新着情報', key: 'news' },
    { href: 'index.html#contact', label: 'お問い合わせ' },
  ],
};

const pageConfigs = {
  home: {
    brandHref: '#top',
    nav: sharedNav.home,
    footer: [
      { href: '#about', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
        { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: '#contact', label: 'お問い合わせ' },
    ],
  },
  history: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'history' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'index.html#about', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
        { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'index.html#contact', label: 'お問い合わせ' },
    ],
  },
  concerts: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'concerts' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'index.html#about', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
        { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'index.html#contact', label: 'お問い合わせ' },
    ],
  },
  join: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'join' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'index.html#about', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
        { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'index.html#contact', label: 'お問い合わせ' },
    ],
  },
  news: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'news' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'index.html#about', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
        { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'index.html#contact', label: 'お問い合わせ' },
    ],
  },
};

const config = pageConfigs[pageKey] || pageConfigs.home;
const instagramUrl = 'https://www.instagram.com/rikkyo_orch?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';
const youtubeUrl = 'https://www.youtube.com/@RUSOChannel/featured';

const instagramIcon = `
  <a class="social-link" href="${instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.25-2.38a1.13 1.13 0 1 1 0 2.25 1.13 1.13 0 0 1 0-2.25Z" fill="currentColor"/>
    </svg>
  </a>
`;

const youtubeIcon = `
  <a class="social-link" href="${youtubeUrl}" target="_blank" rel="noreferrer" aria-label="YouTube">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23 12.003c0-1.382-.154-2.764-.462-4.107a3.2 3.2 0 0 0-2.25-2.266C18.9 5.25 15.999 5 12 5c-3.999 0-6.9.25-8.288.63A3.2 3.2 0 0 0 1.462 7.9 18.39 18.39 0 0 0 1 12.003c0 1.382.154 2.764.462 4.107a3.2 3.2 0 0 0 2.25 2.266C5.1 18.756 8.001 19 12 19c3.999 0 6.9-.244 8.288-.624a3.2 3.2 0 0 0 2.25-2.266c.308-1.343.462-2.725.462-4.107ZM10 15.5v-7l6 3.5-6 3.5Z" fill="currentColor"/>
    </svg>
  </a>
`;

function buildNavLinks(items) {
  return items
    .map((item) => {
      const currentClass = item.current ? 'is-current' : '';
      const classAttr = currentClass ? ` class="${currentClass}"` : '';
      return `<a${classAttr} href="${item.href}">${item.label}</a>`;
    })
    .join('');
}

const headerTarget = document.querySelector('[data-site-header]');
if (headerTarget) {
  headerTarget.outerHTML = `
    <header class="site-header reveal" data-reveal>
      <a class="brand-block" href="${config.brandHref}">
        <p class="brand-sub">Rikkyo University<br class="brand-sub-break" />Symphony Orchestra</p>
        <h1>立教大学交響楽団</h1>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav-panel" aria-label="メニューを開く">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="site-nav-panel" id="site-nav-panel">
        <nav class="global-nav" aria-label="グローバルナビゲーション">
          ${buildNavLinks(config.nav)}
        </nav>
        <div class="header-actions">${instagramIcon}${youtubeIcon}</div>
      </div>
    </header>
  `;
}

const footerTarget = document.querySelector('[data-site-footer]');
if (footerTarget) {
  footerTarget.outerHTML = `
    <footer class="site-footer reveal" data-reveal>
      <p>© 2026 Rikkyo University Symphony Orchestra</p>
      <nav aria-label="フッターナビゲーション">
        ${buildNavLinks(config.footer)}
      </nav>
      <div class="footer-actions">${instagramIcon}${youtubeIcon}</div>
    </footer>
  `;
}

if (!document.querySelector('.ticket-floating-button')) {
  document.body.insertAdjacentHTML('beforeend', '<a class="ticket-floating-button" href="concerts.html">チケット購入はこちら</a>');
}


if (!document.querySelector('.page-transition-overlay')) {
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="page-transition-overlay is-visible" aria-hidden="true">
      <div class="page-transition-overlay__inner">
        <img class="page-transition-overlay__logo" src="assets/univ.png" alt="" />
        <p class="page-transition-overlay__label">立教大学交響楽団</p>
      </div>
    </div>
  `);
}

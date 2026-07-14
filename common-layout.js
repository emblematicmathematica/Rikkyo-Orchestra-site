const pageKey = document.body.dataset.page || 'home';

const sharedNav = {
  home: [
    { href: '#about', label: '楽団紹介' },
    { href: 'history.html', label: '歴史' },
    { href: 'concerts.html', label: '演奏会情報' },
    { href: '#gallery', label: '演奏風景' },
    { href: 'join.html', label: '新入生の方へ' },
    { href: 'news.html', label: '新着情報' },
    { href: '#contact', label: 'お問い合わせ' },
  ],
  sub: [
    { href: 'index.html#about', label: '楽団紹介' },
    { href: 'history.html', label: '歴史', key: 'history' },
    { href: 'concerts.html', label: '演奏会情報', key: 'concerts' },
    { href: 'index.html#gallery', label: '演奏風景' },
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
      { href: 'news.html', label: '新着情報' },
    ],
  },
  history: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'history' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
    ],
  },
  concerts: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'concerts' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'history.html', label: '歴史' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
    ],
  },
  join: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'join' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'news.html', label: '新着情報' },
    ],
  },
  news: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'news' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
    ],
  },
};

const config = pageConfigs[pageKey] || pageConfigs.home;
const instagramUrl = 'https://www.instagram.com/rikkyo_orch?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

const instagramIcon = `
  <a class="social-link" href="${instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.25-2.38a1.13 1.13 0 1 1 0 2.25 1.13 1.13 0 0 1 0-2.25Z" fill="currentColor"/>
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
        <p class="brand-sub">Rikkyo University Symphony Orchestra</p>
        <h1>立教大学交響楽団</h1>
      </a>
      <nav class="global-nav" aria-label="グローバルナビゲーション">
        ${buildNavLinks(config.nav)}
      </nav>
      <div class="header-actions">${instagramIcon}</div>
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
      <div class="footer-actions">${instagramIcon}</div>
    </footer>
  `;
}

const pageKey = document.body.dataset.page || 'home';

const pageConfigs = {
  home: {
    brandHref: '#top',
    nav: [
      { href: '#about', label: '楽団紹介', key: 'about' },
      { href: 'history.html', label: '歴史', key: 'history' },
      { href: '#concerts', label: '演奏会情報', key: 'concerts' },
      { href: '#gallery', label: '演奏風景', key: 'gallery' },
      { href: '#join', label: '新入生の方へ', key: 'join' },
      { href: '#news', label: '新着情報', key: 'news' },
      { href: '#contact', label: 'お問い合わせ', key: 'contact' },
    ],
    footer: [
      { href: '#about', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: '#concerts', label: '演奏会情報' },
      { href: '#gallery', label: '演奏風景' },
    ],
  },
  history: {
    brandHref: 'index.html',
    nav: [
      { href: 'index.html#about', label: '楽団紹介', key: 'about' },
      { href: 'history.html', label: '歴史', key: 'history', current: true },
      { href: 'index.html#concerts', label: '演奏会情報', key: 'concerts' },
      { href: 'index.html#gallery', label: '演奏風景', key: 'gallery' },
      { href: 'index.html#join', label: '新入生の方へ', key: 'join' },
      { href: 'index.html#news', label: '新着情報', key: 'news' },
      { href: 'index.html#contact', label: 'お問い合わせ', key: 'contact' },
    ],
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'history.html', label: '歴史' },
      { href: 'index.html#concerts', label: '演奏会情報' },
      { href: 'index.html#contact', label: 'お問い合わせ' },
    ],
  },
};

const config = pageConfigs[pageKey] || pageConfigs.home;

function buildNavLinks(items) {
  return items
    .map((item) => {
      const currentClass = item.current ? ' is-current' : '';
      return `<a class="${currentClass.trim()}" href="${item.href}">${item.label}</a>`;
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
    </footer>
  `;
}

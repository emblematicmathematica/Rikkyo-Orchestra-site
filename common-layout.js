const pageKey = document.body.dataset.page || 'home';

const sharedNav = {
  home: [
    {
      label: '楽団紹介',
      children: [
        { href: 'about.html', label: '立響とは' },
        { href: 'history.html', label: '歴史' },
        { href: 'video-archive.html', label: '演奏会アーカイブ' },
      ],
    },
    {
      label: '演奏会情報',
      children: [
        { href: 'concerts.html', label: '最新の公演情報' },
        { href: 'concerts-archive.html', label: '過去の演奏会' },
      ],
    },
    {
      label: '新入生の方へ',
      children: [
        { href: 'join.html#requirements', label: '募集要項' },
        { href: 'join.html#freshers-info', label: '新歓情報' },
        { href: 'join.html#official-line', label: '新歓公式ライン' },
      ],
    },
    { href: 'news.html', label: '新着情報' },
    {
      label: 'お問い合わせ',
      children: [
        { href: 'support.html', label: 'ご寄付について' },
        { href: 'tickets.html', label: 'チケットについて' },
        { href: 'performance.html', label: '依頼演奏について' },
      ],
    },
  ],
  sub: [
    {
      label: '楽団紹介',
      children: [
        { href: 'about.html', label: '立響とは', key: 'about' },
        { href: 'history.html', label: '歴史', key: 'history' },
        { href: 'video-archive.html', label: '演奏会アーカイブ', key: 'video_archive' },
      ],
    },
    {
      label: '演奏会情報',
      children: [
        { href: 'concerts.html', label: '最新の公演情報', key: 'concerts' },
        { href: 'concerts-archive.html', label: '過去の演奏会', key: 'concerts_archive' },
      ],
    },
    {
      label: '新入生の方へ',
      key: 'join',
      children: [
        { href: 'join.html#requirements', label: '募集要項', key: 'join_requirements' },
        { href: 'join.html#freshers-info', label: '新歓情報', key: 'join_freshers' },
        { href: 'join.html#official-line', label: '新歓公式ライン', key: 'join_line' },
      ],
    },
    { href: 'news.html', label: '新着情報', key: 'news' },
    {
      label: 'お問い合わせ',
      children: [
        { href: 'support.html', label: 'ご寄付について', key: 'support' },
        { href: 'tickets.html', label: 'チケットについて', key: 'tickets' },
        { href: 'performance.html', label: '依頼演奏について', key: 'performance' },
      ],
    },
  ],
};

const pageConfigs = {
  home: {
    brandHref: '#top',
    nav: sharedNav.home,
    footer: [
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  about: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'about' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  history: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'history' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  video_archive: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'video_archive' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'video-archive.html', label: '演奏会アーカイブ' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  admin: {
    brandHref: 'index.html',
    nav: sharedNav.sub,
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  concerts: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'concerts' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  concerts_archive: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'concerts_archive' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  join: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'join' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  news: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => item.key === 'news' ? { ...item, current: true } : item),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  contact: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'contact' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  support: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'support' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  tickets: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'tickets' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
  performance: {
    brandHref: 'index.html',
    nav: sharedNav.sub.map((item) => {
      if (!item.children) return item;
      return {
        ...item,
        children: item.children.map((child) => child.key === 'performance' ? { ...child, current: true } : child),
      };
    }),
    footer: [
      { href: 'index.html', label: 'トップ' },
      { href: 'about.html', label: '楽団紹介' },
      { href: 'history.html', label: '歴史' },
      { href: 'concerts.html', label: '演奏会情報' },
      { href: 'join.html', label: '新入生の方へ' },
      { href: 'news.html', label: '新着情報' },
      { href: 'contact.html', label: 'お問い合わせ' },
    ],
  },
};

const config = pageConfigs[pageKey] || pageConfigs.home;
const instagramUrl = 'https://www.instagram.com/rikkyo_orch?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';
const youtubeUrl = 'https://www.youtube.com/@RUSOChannel/featured';
const xUrl = 'https://x.com/Rikkyo_orch';

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

const xIcon = `
  <a class="social-link" href="${xUrl}" target="_blank" rel="noreferrer" aria-label="X">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.114 8.13L22.75 22h-6.55l-5.13-6.71L5.2 22H1.94l7.615-8.704L1.53 2h6.716l4.637 6.13L18.244 2Zm-1.143 17.91h1.804L7.265 3.98H5.33L17.1 19.91Z" fill="currentColor"/>
    </svg>
  </a>
`;

function buildNavLinks(items) {
  return items
    .map((item) => {
      if (item.children) {
        const childLinks = item.children
          .map((child) => {
            const childClass = child.current ? 'is-current' : '';
            const childAttr = childClass ? ` class="${childClass}"` : '';
            return `<a${childAttr} href="${child.href}">${child.label}</a>`;
          })
          .join('');
        const currentGroup = item.children.some((child) => child.current) ? ' is-current' : '';
        return `
          <details class="nav-group${currentGroup}" open>
            <summary>${item.label}</summary>
            <div class="nav-submenu">
              ${childLinks}
            </div>
          </details>
        `;
      }
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
        <p class="brand-sub">Rikkyo University <br class="brand-sub-break" />Symphony Orchestra</p>
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
        <div class="header-actions">${instagramIcon}${youtubeIcon}${xIcon}</div>
      </div>
    </header>
  `;
}

const footerTarget = document.querySelector('[data-site-footer]');
if (footerTarget) {
  footerTarget.outerHTML = `
    <footer class="site-footer">
      <div class="footer-brand">
        <p class="footer-brand-sub">Rikkyo University Symphony Orchestra</p>
        <h2>立教大学交響楽団</h2>
      </div>
      <div class="footer-nav-wrap">
        <p class="footer-heading">Contents</p>
        <nav aria-label="フッターナビゲーション">
          ${buildNavLinks(config.footer)}
        </nav>
      </div>
      <div class="footer-connect">
        <p class="footer-heading">Connect</p>
        <div class="footer-actions">${instagramIcon}${youtubeIcon}${xIcon}</div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© 2026 Rikkyo University Symphony Orchestra</p>
        <a class="footer-admin-link" href="https://app.pagescms.org/sign-in?redirect=%2F" target="_blank" rel="noreferrer nofollow">管理者入口</a>
      </div>
    </footer>
  `;
}

if (!document.querySelector('.ticket-floating-button')) {
  document.body.insertAdjacentHTML('beforeend', '<a class="ticket-floating-button" href="tickets.html">チケット購入はこちら</a>');
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

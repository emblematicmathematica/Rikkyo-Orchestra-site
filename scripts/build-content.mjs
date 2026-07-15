import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const inlineMarkdown = (value) => escapeHtml(value)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

function parseMarkdown(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: front matterが見つかりません。`);

  const data = {};
  let currentListKey = '';
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(listItem[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }

    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!value) {
      data[key] = [];
      currentListKey = key;
      continue;
    }

    currentListKey = '';
    data[key] = value.startsWith('[') ? JSON.parse(value) : value.replace(/^['"]|['"]$/g, '');
  }

  for (const field of ['title', 'date', 'dateLabel', 'category', 'excerpt']) {
    if (!data[field]) throw new Error(`${filename}: ${field}が未入力です。`);
  }

  return {
    ...data,
    slug: path.basename(filename, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
    body: match[2].trim(),
  };
}

function renderMarkdown(source) {
  const blocks = source.split(/\r?\n\s*\r?\n/).filter(Boolean);
  return blocks.map((block) => {
    const line = block.trim();
    if (line.startsWith('### ')) return `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
    if (line.startsWith('## ')) return `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
    if (line.split(/\r?\n/).every((item) => item.startsWith('- '))) {
      return `<ul>${line.split(/\r?\n/).map((item) => `<li>${inlineMarkdown(item.slice(2))}</li>`).join('')}</ul>`;
    }
    return `<p>${inlineMarkdown(line.replace(/\r?\n/g, ' '))}</p>`;
  }).join('\n          ');
}

function renderNewsGallery(item) {
  if (!Array.isArray(item.images) || item.images.length === 0) return '';

  const images = item.images.map((image, index) => `            <figure>
              <img src="${escapeHtml(image)}" alt="${escapeHtml(item.title)}の写真 ${index + 1}" loading="lazy" decoding="async" />
            </figure>`).join('\n');

  return `\n          <div class="news-article-gallery">\n${images}\n          </div>`;
}

async function replaceGenerated(filename, key, content) {
  const filePath = path.join(root, filename);
  const source = await readFile(filePath, 'utf8');
  const start = `<!-- content:${key}:start -->`;
  const end = `<!-- content:${key}:end -->`;
  const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  if (!pattern.test(source)) throw new Error(`${filename}: ${key}の生成マーカーが見つかりません。`);
  await writeFile(filePath, source.replace(pattern, `${start}\n${content}\n${end}`));
}

function renderNewsCard(item, indent = '          ') {
  const url = `news-${item.slug}.html`;
  return `${indent}<article class="news-card">
${indent}  <div class="news-meta"><time datetime="${escapeHtml(item.date)}">${escapeHtml(item.dateLabel)}</time><span>${escapeHtml(item.category)}</span></div>
${indent}  <h3><a href="${url}">${escapeHtml(item.title)}</a></h3>
${indent}  <p>${escapeHtml(item.excerpt)}</p>
${indent}</article>`;
}

function renderNewsPage(item) {
  return `<!DOCTYPE html>
<!-- generated:news -->
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(item.excerpt)}" />
    <title>${escapeHtml(item.title)} | 立教大学交響楽団</title>
    <style>html,body{background:#0b0a0d;color:#f2ece2;}</style>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body class="subpage-body news-detail-body" data-page="news">
    <main class="orchestra-site subpage">
      <div data-site-header></div>
      <section class="subpage-hero reveal" data-reveal>
        <div class="subpage-hero-inner">
          <p class="eyebrow">News</p>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="news-detail-date"><time datetime="${escapeHtml(item.date)}">${escapeHtml(item.dateLabel)}</time><span>${escapeHtml(item.category)}</span></p>
          <p>${escapeHtml(item.excerpt)}</p>
        </div>
      </section>
      <section class="section-block reveal" data-reveal>
        <article class="history-article">
          ${renderMarkdown(item.body)}${renderNewsGallery(item)}
        </article>
      </section>
      <section class="section-block reveal" data-reveal>
        <div class="section-inline-link centered-links"><a href="news.html">新着情報一覧へ戻る</a><a href="index.html#news">トップの新着情報へ</a></div>
      </section>
      <div data-site-footer></div>
    </main>
    <script src="common-layout.js" defer></script>
    <script src="script.js" defer></script>
  </body>
</html>
`;
}

function renderFeatureConcert(concert, page = false) {
  const ticket = concert.ticketUrl
    ? `<a class="primary-link" href="${escapeHtml(concert.ticketUrl)}">${escapeHtml(concert.ticketLabel || 'チケット購入はこちら')}</a>`
    : `<a class="primary-link disabled-link" href="#" aria-disabled="true">${escapeHtml(concert.ticketLabel || 'チケット販売サイト準備中')}</a>\n              <p>販売ページのURLが決まり次第、こちらにリンクを掲載します。</p>`;

  return `        <div class="feature-concert${page ? ' page-feature-concert' : ''}">
          <div class="feature-concert-image">
            <img src="${escapeHtml(concert.image)}" alt="${escapeHtml(concert.imageAlt)}" loading="lazy" decoding="async" />
          </div>
          <div class="feature-concert-body">
            <p class="concert-season">${page ? 'Upcoming Concert' : 'Main Stage'}</p>
            <h3>${escapeHtml(concert.title)}</h3>
            <dl>
              <div><dt>日時</dt><dd>${escapeHtml(concert.dateLabel)} ${escapeHtml(concert.time)}</dd></div>
              <div><dt>会場</dt><dd>${escapeHtml(concert.venue)}</dd></div>
              <div><dt>${page ? '備考' : '内容'}</dt><dd>${escapeHtml(concert.note)}</dd></div>
            </dl>
            ${page ? `<div class="ticket-placeholder">\n              ${ticket}\n            </div>` : '<a class="dark-link" href="concerts.html">演奏会情報ページへ</a>'}
          </div>
        </div>`;
}

function renderArchive(concerts) {
  const years = [...new Set(concerts.map((concert) => concert.year))].sort((a, b) => b - a);
  return years.map((year) => {
    const cards = concerts
      .filter((concert) => concert.year === year)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((concert) => `          <article class="archive-concert-card">
            <div class="archive-concert-visual${concert.imageClass ? ` ${escapeHtml(concert.imageClass)}` : ''}">
              <img src="${escapeHtml(concert.image)}" alt="${escapeHtml(concert.imageAlt)}" loading="lazy" decoding="async" />
            </div>
            <div class="archive-concert-body">
              <p class="concert-season">${escapeHtml(concert.date.replaceAll('-', '.'))}</p>
              <h3>${escapeHtml(concert.title)}</h3>
              <dl>
                <div><dt>日程</dt><dd>${escapeHtml(concert.dateLabel)}</dd></div>
                <div><dt>会場</dt><dd>${escapeHtml(concert.venue)}</dd></div>
                <div><dt>備考</dt><dd>${escapeHtml(concert.note)}</dd></div>
              </dl>
            </div>
          </article>`).join('\n');

    return `      <section class="section-block reveal" data-reveal>
        <div class="section-heading">
          <p>${year}</p>
          <h2>${year}年度</h2>
        </div>
        <div class="archive-concert-list">
${cards}
        </div>
      </section>`;
  }).join('\n\n');
}

const recruitmentStatusLabels = {
  preparing: '準備中',
  open: '受付中',
  closed: '受付終了',
};

function renderRecruitment(recruitment) {
  const requirements = recruitment.requirements.map((item) => `          <article class="detail-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('\n');
  const events = [...recruitment.events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((event) => `            <article class="recruitment-event">
              <time datetime="${escapeHtml(event.date)}">${escapeHtml(event.dateLabel)}</time>
              <div><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.description)}</p></div>
            </article>`).join('\n');
  const schedule = events || `            <p class="recruitment-empty">${escapeHtml(recruitment.scheduleMessage)}</p>`;
  const flyer = recruitment.flyer
    ? `          <figure class="recruitment-flyer"><img src="${escapeHtml(recruitment.flyer)}" alt="${escapeHtml(recruitment.flyerAlt || `${recruitment.year}年度の新歓チラシ`)}" loading="lazy" decoding="async" /></figure>`
    : '';
  const lineLink = recruitment.lineUrl
    ? `<a class="dark-link" href="${escapeHtml(recruitment.lineUrl)}" target="_blank" rel="noreferrer">${escapeHtml(recruitment.lineLabel)}</a>`
    : `<a class="dark-link disabled-link" href="#" aria-disabled="true">${escapeHtml(recruitment.lineLabel)}</a>`;

  return `      <section class="section-block reveal" data-reveal id="requirements">
        <div class="section-heading"><p>${recruitment.year} Requirements</p><h2>募集要項</h2></div>
        <div class="detail-list two-column">
${requirements}
        </div>
      </section>
      <section class="section-block reveal" data-reveal id="freshers-info">
        <div class="section-heading"><p>${recruitment.year} Freshers Information</p><h2>新歓情報</h2></div>
        <div class="recruitment-layout${recruitment.flyer ? '' : ' recruitment-layout--single'}">
          <div class="recruitment-main">
            <div class="recruitment-heading">
              <span class="recruitment-status recruitment-status--${escapeHtml(recruitment.status)}">${escapeHtml(recruitmentStatusLabels[recruitment.status] || recruitment.status)}</span>
              <h3>${escapeHtml(recruitment.headline)}</h3>
              <p>${escapeHtml(recruitment.intro)}</p>
            </div>
            <div class="recruitment-events">
${schedule}
            </div>
            <a class="dark-link" href="${escapeHtml(recruitment.contactUrl)}">${escapeHtml(recruitment.contactLabel)}</a>
          </div>
${flyer}
        </div>
      </section>
      <section class="section-block reveal" data-reveal id="official-line">
        <div class="section-heading"><p>Official LINE</p><h2>新歓公式ライン</h2></div>
        <div class="contact-box recruitment-line">
          <p>${escapeHtml(recruitment.lineDescription)}</p>
          ${lineLink}
        </div>
      </section>`;
}

async function build() {
  const newsDirectory = path.join(root, 'content/news');
  const newsFiles = (await readdir(newsDirectory)).filter((file) => file.endsWith('.md'));
  const news = await Promise.all(newsFiles.map(async (file) => parseMarkdown(await readFile(path.join(newsDirectory, file), 'utf8'), file)));
  news.sort((a, b) => b.date.localeCompare(a.date));

  await replaceGenerated('index.html', 'news-home', news.slice(0, 4).map((item) => renderNewsCard(item, '          ')).join('\n'));
  await replaceGenerated('news.html', 'news-list', news.map((item) => renderNewsCard(item, '          ')).join('\n'));

  const generatedNewsFiles = new Set(news.map((item) => `news-${item.slug}.html`));
  const rootFiles = await readdir(root);
  await Promise.all(rootFiles
    .filter((file) => /^news-.+\.html$/.test(file) && !generatedNewsFiles.has(file))
    .map(async (file) => {
      const filePath = path.join(root, file);
      const source = await readFile(filePath, 'utf8');
      if (source.includes('<!-- generated:news -->')) await unlink(filePath);
    }));
  await Promise.all(news.map((item) => writeFile(path.join(root, `news-${item.slug}.html`), renderNewsPage(item))));

  const concerts = JSON.parse(await readFile(path.join(root, 'content/concerts.json'), 'utf8'));
  const upcoming = concerts.upcoming;
  await replaceGenerated('index.html', 'upcoming-card', `            <a class="hero-card hero-card-link" href="concerts.html">
              <p>Upcoming Concert</p>
              <strong>${escapeHtml(upcoming.title)}</strong>
              <span>${escapeHtml(upcoming.dateLabel)}<br />${escapeHtml(upcoming.venue)}</span>
            </a>`);
  await replaceGenerated('index.html', 'upcoming-feature', renderFeatureConcert(upcoming));
  await replaceGenerated('concerts.html', 'upcoming-feature', renderFeatureConcert(upcoming, true));
  await replaceGenerated('concerts-archive.html', 'concert-archive', renderArchive(concerts.archive));

  const recruitmentDirectory = path.join(root, 'content/recruitment');
  const recruitmentFiles = (await readdir(recruitmentDirectory)).filter((file) => file.endsWith('.json'));
  const recruitmentEntries = await Promise.all(recruitmentFiles.map(async (file) => {
    const entry = JSON.parse(await readFile(path.join(recruitmentDirectory, file), 'utf8'));
    for (const field of ['year', 'status', 'headline', 'intro', 'requirements', 'events', 'scheduleMessage', 'lineLabel', 'lineDescription', 'contactUrl', 'contactLabel']) {
      if (entry[field] === undefined || entry[field] === null) throw new Error(`${file}: ${field}が未入力です。`);
    }
    return entry;
  }));
  const publishedRecruitment = recruitmentEntries
    .filter((entry) => entry.published)
    .sort((a, b) => b.year - a.year)[0];
  if (!publishedRecruitment) throw new Error('公開中の新歓情報がありません。');
  await replaceGenerated('join.html', 'recruitment', renderRecruitment(publishedRecruitment));

  console.log(`Generated ${news.length} news pages, ${concerts.archive.length} archived concerts, and recruitment for ${publishedRecruitment.year}.`);
}

await build();

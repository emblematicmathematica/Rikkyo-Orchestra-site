import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const safeAssetPattern = /^assets\/(?!.*(?:^|\/)\.\.(?:\/|$))[^\0]+$/;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const inlineMarkdown = (value) => escapeHtml(value)
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

function assertLength(value, filename, field, maximum, minimum = 0) {
  const length = String(value || '').trim().length;
  if (length < minimum || length > maximum) {
    throw new Error(`${filename}: ${field}は${minimum}〜${maximum}文字で入力してください。`);
  }
}

function assertIsoDate(value, filename, field) {
  if (!isoDatePattern.test(String(value || ''))) throw new Error(`${filename}: ${field}はYYYY-MM-DD形式で入力してください。`);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${filename}: ${field}に実在する日付を入力してください。`);
  }
}

function assertHttpsUrl(value, filename, field) {
  if (!value) return;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${filename}: ${field}に正しいURLを入力してください。`);
  }
  if (url.protocol !== 'https:') throw new Error(`${filename}: ${field}はhttps://から始めてください。`);
}

function assertLocalUrl(value, filename, field) {
  if (/^[a-z0-9_-]+\.html(?:#[a-zA-Z0-9_-]+)?$/.test(String(value || ''))) return;
  assertHttpsUrl(value, filename, field);
}

function assertAssetPath(value, filename, field) {
  if (!value) return;
  if (!safeAssetPattern.test(String(value))) throw new Error(`${filename}: ${field}はassetsフォルダ内の画像を指定してください。`);
}

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
  assertLength(data.title, filename, 'title', 120, 2);
  assertIsoDate(data.date, filename, 'date');
  assertLength(data.dateLabel, filename, 'dateLabel', 40, 1);
  assertLength(data.category, filename, 'category', 30, 1);
  assertLength(data.excerpt, filename, 'excerpt', 240, 10);
  if (!match[2].trim()) throw new Error(`${filename}: 本文が未入力です。`);
  if (data.images && !Array.isArray(data.images)) throw new Error(`${filename}: imagesは画像の一覧で入力してください。`);
  if (data.images?.length > 8) throw new Error(`${filename}: 記事画像は8枚までです。`);
  data.images?.forEach((image) => assertAssetPath(image, filename, 'images'));

  const filenameWithoutExtension = path.basename(filename, '.md');
  const articleSlug = filenameWithoutExtension.replace(/^\d{4}-\d{2}-\d{2}-/, '') || data.date;

  return {
    ...data,
    slug: articleSlug,
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

async function replaceGeneratedScript(filename, key, content) {
  const filePath = path.join(root, filename);
  const source = await readFile(filePath, 'utf8');
  const start = `/* content:${key}:start */`;
  const end = `/* content:${key}:end */`;
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

function renderNewsPager(olderArticle, newerArticle) {
  const olderLink = olderArticle
    ? `<a class="news-pager-link news-pager-link--older" href="news-${escapeHtml(olderArticle.slug)}.html" rel="prev"><span>前の記事</span><strong>${escapeHtml(olderArticle.title)}</strong></a>`
    : '<span class="news-pager-spacer" aria-hidden="true"></span>';
  const newerLink = newerArticle
    ? `<a class="news-pager-link news-pager-link--newer" href="news-${escapeHtml(newerArticle.slug)}.html" rel="next"><span>次の記事</span><strong>${escapeHtml(newerArticle.title)}</strong></a>`
    : '<span class="news-pager-spacer" aria-hidden="true"></span>';

  return `<nav class="news-pager" aria-label="新着記事の前後移動">${olderLink}${newerLink}</nav>`;
}

function renderNewsPage(item, olderArticle, newerArticle) {
  return `<!DOCTYPE html>
<!-- generated:news -->
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self'; form-action 'self' mailto:; upgrade-insecure-requests" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta name="description" content="${escapeHtml(item.excerpt)}" />
    <title>${escapeHtml(item.title)} | 立教大学交響楽団</title>
    <style>html,body{background:#0b0a0d;color:#f2ece2;}</style>
    <link rel="stylesheet" href="styles.css?v=20260720-1" />
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
        ${renderNewsPager(olderArticle, newerArticle)}
        <div class="section-inline-link centered-links"><a href="news.html">新着情報一覧へ戻る</a><a href="index.html#news">トップの新着情報へ</a></div>
      </section>
      <div data-site-footer></div>
    </main>
    <script src="common-layout.js?v=20260719-1" defer></script>
    <script src="script.js?v=20260720-1" defer></script>
  </body>
</html>
`;
}

function toConcertLines(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function getConcertDetails(concert) {
  const conductor = toConcertLines(concert.conductor);
  const performers = toConcertLines(concert.performers);
  const program = toConcertLines(concert.program);
  const noteLines = toConcertLines(concert.note);
  let activeSection = '';

  if (conductor.length === 0 && performers.length === 0 && program.length === 0) {
    for (const line of noteLines) {
      const programHeading = line.match(/^曲目\s*[:：]?\s*(.*)$/);
      const conductorLine = line.match(/^指揮\s*[:：]\s*(.*)$/);
      const performerLine = line.match(/^(独奏|ピアノ|ヴァイオリン|オルガン|独唱|チェロ)\s*[:：]\s*(.*)$/);
      if (programHeading) {
        activeSection = 'program';
        if (programHeading[1]) program.push(programHeading[1]);
      } else if (conductorLine) {
        activeSection = 'conductor';
        if (conductorLine[1]) conductor.push(conductorLine[1]);
      } else if (performerLine) {
        activeSection = 'performers';
        performers.push(`${performerLine[1]}：${performerLine[2]}`);
      } else if (activeSection === 'conductor' && !line.includes('：') && !line.includes(':')) {
        conductor.push(line);
      } else {
        activeSection = 'program';
        program.push(line);
      }
    }
  }

  return {
    conductor: conductor.length > 0 ? conductor : ['記録を確認中'],
    performers,
    program: program.length > 0 ? program : ['記録を確認中'],
    ticket: toConcertLines(concert.ticketInfo || '販売終了'),
  };
}

function renderConcertLines(lines) {
  if (lines.length === 1) return escapeHtml(lines[0]);
  return `<ul class="concert-detail-list">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
}

function renderFeatureConcert(concert, page = false, position = 0) {
  const details = getConcertDetails(concert);
  const image = concert.image || 'assets/8022.png';
  const imageAlt = concert.imageAlt || `${concert.title}の公演イメージ`;

  const ticketHref = concert.ticketUrl || 'concerts.html';
  const ticket = `<a class="ticket-floating-button ticket-inline-button" href="${escapeHtml(ticketHref)}">
                <span class="ticket-floating-kicker">Ticket</span>
                <span class="ticket-floating-label">チケット購入はこちら</span>
                <span class="ticket-floating-arrow" aria-hidden="true">→</span>
              </a>`;

  return `        <div class="feature-concert${page ? ' page-feature-concert' : ''}">
          <div class="feature-concert-image">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(imageAlt)}" loading="lazy" decoding="async" />
          </div>
          <div class="feature-concert-body">
            <p class="concert-season">${page ? (position === 0 ? 'Upcoming Concert' : 'Following Concert') : (position === 0 ? 'Main Stage' : 'Next Stage')}</p>
            <h3>${escapeHtml(concert.title)}</h3>
            <dl>
              <div><dt>日時</dt><dd>${escapeHtml(concert.dateLabel)} ${escapeHtml(concert.time)}</dd></div>
              <div><dt>会場</dt><dd>${escapeHtml(concert.venue)}</dd></div>
              <div><dt>指揮</dt><dd>${renderConcertLines(details.conductor)}</dd></div>
              <div><dt>曲目</dt><dd>${renderConcertLines(details.program)}</dd></div>
              <div><dt>チケット情報</dt><dd>${renderConcertLines(details.ticket)}
              ${ticket}</dd></div>
            </dl>
          </div>
        </div>`;
}

function renderArchive(concerts) {
  const years = [...new Set(concerts.map((concert) => concert.year))].sort((a, b) => b - a);
  const sections = years.map((year) => {
    const cards = concerts
      .filter((concert) => concert.year === year)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .map((concert) => {
        const details = getConcertDetails(concert);
        const visual = concert.image
          ? `<div class="archive-concert-visual">
              <img src="${escapeHtml(concert.image)}" alt="${escapeHtml(concert.imageAlt || `${concert.title}のチラシ`)}" loading="lazy" decoding="async" />
            </div>`
          : '';

        return `          <article class="archive-concert-card${concert.image ? '' : ' archive-concert-card--text-only'}">${visual ? `
            ${visual}` : ''}
            <div class="archive-concert-body">
              <p class="concert-season">${escapeHtml(concert.date ? concert.date.replaceAll('-', '.') : `${concert.year}`)}</p>
              <h3>${escapeHtml(concert.title)}</h3>
              <dl>
                <div><dt>日時</dt><dd>${escapeHtml(concert.dateLabel)}</dd></div>
                <div><dt>会場</dt><dd>${escapeHtml(concert.venue)}</dd></div>
                <div><dt>指揮</dt><dd>${renderConcertLines(details.conductor)}</dd></div>${details.performers.length > 0 ? `
                <div><dt>出演</dt><dd>${renderConcertLines(details.performers)}</dd></div>` : ''}
                <div><dt>曲目</dt><dd>${renderConcertLines(details.program)}</dd></div>
              </dl>
            </div>
          </article>`;
      }).join('\n');

    return `        <section class="section-block archive-year-section reveal" id="archive-year-${year}" data-archive-year="${year}" data-reveal>
        <div class="section-heading">
          <p>${year}</p>
          <h2>${year}年度</h2>
        </div>
        <div class="archive-concert-list">
${cards}
        </div>
        </section>`;
  }).join('\n\n');

  const yearLinks = years.map((year) => `            <a href="#archive-year-${year}" data-archive-year-link="${year}">${year}年度</a>`).join('\n');

  return `      <div class="archive-browser" data-archive-browser>
        <aside class="archive-sidebar" aria-label="過去の演奏会を絞り込む">
          <div class="archive-search">
            <label for="archive-search-input">公演を検索</label>
            <input id="archive-search-input" type="search" placeholder="公演名・会場・指揮・曲目" autocomplete="off" data-archive-search />
            <p data-archive-search-status>${concerts.length}件の公演</p>
          </div>
          <nav class="archive-year-nav" aria-label="年度から探す">
            <p>年度から探す</p>
            <div class="archive-year-links">
${yearLinks}
            </div>
          </nav>
        </aside>
        <div class="archive-results" data-archive-results>
${sections}
          <p class="archive-no-results" data-archive-no-results hidden>該当する公演が見つかりませんでした。</p>
        </div>
      </div>`;
}

function renderVideoArchive(videos) {
  return videos.slice(0, 30).map((video) => `          <article class="video-archive-card">
            <a class="video-archive-thumbnail" href="${escapeHtml(video.url)}" target="_blank" rel="noreferrer">
              <img src="${escapeHtml(video.thumbnail)}" alt="${escapeHtml(video.title)}" loading="lazy" decoding="async" />
              <span class="performance-video-play" aria-hidden="true">▶</span>
            </a>
            <h3>${escapeHtml(video.title)}</h3>
            ${video.duration ? `<p>${escapeHtml(video.duration)}</p>` : ''}
          </article>`).join('\n');
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
    .filter((file) => /^news-.*\.html$/.test(file) && !generatedNewsFiles.has(file))
    .map(async (file) => {
      const filePath = path.join(root, file);
      const source = await readFile(filePath, 'utf8');
      if (source.includes('<!-- generated:news -->')) await unlink(filePath);
    }));
  await Promise.all(news.map((item, index) => {
    const newerArticle = news[index - 1];
    const olderArticle = news[index + 1];
    return writeFile(path.join(root, `news-${item.slug}.html`), renderNewsPage(item, olderArticle, newerArticle));
  }));

  const concertDirectory = path.join(root, 'content/concerts');
  const concertFiles = (await readdir(concertDirectory)).filter((file) => file.endsWith('.json'));
  const concerts = await Promise.all(concertFiles.map(async (file) => {
    const concert = JSON.parse(await readFile(path.join(concertDirectory, file), 'utf8'));
    for (const field of ['title', 'date', 'dateLabel', 'venue', 'year']) {
      if (concert[field] === undefined || concert[field] === null || concert[field] === '') throw new Error(`${file}: ${field}が未入力です。`);
    }
    assertLength(concert.title, file, 'title', 140, 2);
    assertIsoDate(concert.date, file, 'date');
    assertLength(concert.dateLabel, file, 'dateLabel', 60, 1);
    assertLength(concert.venue, file, 'venue', 120, 1);
    if (!Number.isInteger(concert.year) || concert.year < 1919 || concert.year > 2100) throw new Error(`${file}: yearは1919〜2100の整数で入力してください。`);
    assertAssetPath(concert.image, file, 'image');
    assertHttpsUrl(concert.ticketUrl, file, 'ticketUrl');
    return concert;
  }));
  const today = process.env.CONCERT_REFERENCE_DATE || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const futureConcerts = concerts
    .filter((concert) => concert.date && concert.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const fallbackConcert = {
      title: '次回演奏会は準備中です',
      dateLabel: '詳細決定後に掲載',
      time: '',
      venue: '未定',
      conductor: '決まり次第掲載いたします。',
      program: ['決まり次第掲載いたします。'],
      ticketInfo: ['販売情報は決まり次第掲載いたします。'],
      note: '次回公演の詳細は、決まり次第お知らせします。',
      image: 'assets/8022.png',
      imageAlt: '本番ステージで演奏する立教大学交響楽団',
      ticketLabel: 'チケット販売サイト準備中',
    };
  const upcomingConcerts = futureConcerts.length > 0 ? [futureConcerts[0]] : [fallbackConcert];
  if (futureConcerts.length > 1) {
    const firstDate = new Date(`${futureConcerts[0].date}T00:00:00+09:00`);
    const secondDate = new Date(`${futureConcerts[1].date}T00:00:00+09:00`);
    const daysBetween = Math.round((secondDate - firstDate) / 86_400_000);
    if (daysBetween <= 90) upcomingConcerts.push(futureConcerts[1]);
  }
  const upcoming = upcomingConcerts[0];
  const archivedConcerts = concerts.filter((concert) => !concert.date || concert.date < today);
  await replaceGenerated('index.html', 'upcoming-card', `            <a class="hero-card hero-card-link" href="concerts.html">
              <p>Upcoming Concert</p>
              <strong>${escapeHtml(upcoming.title)}</strong>
              <span>${escapeHtml(upcoming.dateLabel)}<br />${escapeHtml(upcoming.venue)}</span>
            </a>`);
  await replaceGenerated('index.html', 'upcoming-feature', upcomingConcerts.map((concert, index) => renderFeatureConcert(concert, false, index)).join('\n'));
  await replaceGenerated('concerts.html', 'upcoming-feature', upcomingConcerts.map((concert, index) => renderFeatureConcert(concert, true, index)).join('\n'));
  await replaceGeneratedScript('common-layout.js', 'ticket-url', `const activeTicketUrl = ${JSON.stringify(upcoming.ticketUrl || 'concerts.html')};`);
  await replaceGenerated('concerts-archive.html', 'concert-archive', renderArchive(archivedConcerts));

  const videoArchive = JSON.parse(await readFile(path.join(root, 'content/videos.json'), 'utf8'));
  if (!Array.isArray(videoArchive.videos) || videoArchive.videos.length === 0) {
    throw new Error('content/videos.json: videosが空です。');
  }
  await replaceGenerated('video-archive.html', 'video-archive', renderVideoArchive(videoArchive.videos));

  const recruitmentDirectory = path.join(root, 'content/recruitment');
  const recruitmentFiles = (await readdir(recruitmentDirectory)).filter((file) => file.endsWith('.json'));
  const recruitmentEntries = await Promise.all(recruitmentFiles.map(async (file) => {
    const entry = JSON.parse(await readFile(path.join(recruitmentDirectory, file), 'utf8'));
    for (const field of ['year', 'status', 'headline', 'intro', 'requirements', 'events', 'scheduleMessage', 'lineLabel', 'lineDescription', 'contactUrl', 'contactLabel']) {
      if (entry[field] === undefined || entry[field] === null || entry[field] === '') throw new Error(`${file}: ${field}が未入力です。`);
    }
    if (!Number.isInteger(entry.year) || entry.year < 2020 || entry.year > 2100) throw new Error(`${file}: yearは2020〜2100の整数で入力してください。`);
    if (!Object.hasOwn(recruitmentStatusLabels, entry.status)) throw new Error(`${file}: statusが正しくありません。`);
    if (!Array.isArray(entry.requirements) || entry.requirements.length < 1 || entry.requirements.length > 8) throw new Error(`${file}: requirementsは1〜8件で入力してください。`);
    if (!Array.isArray(entry.events) || entry.events.length > 20) throw new Error(`${file}: eventsは20件までです。`);
    entry.requirements.forEach((requirement, index) => {
      assertLength(requirement.title, file, `requirements[${index}].title`, 80, 1);
      assertLength(requirement.description, file, `requirements[${index}].description`, 500, 1);
    });
    entry.events.forEach((event, index) => {
      assertIsoDate(event.date, file, `events[${index}].date`);
      assertLength(event.dateLabel, file, `events[${index}].dateLabel`, 60, 1);
      assertLength(event.title, file, `events[${index}].title`, 100, 1);
      assertLength(event.description, file, `events[${index}].description`, 500, 1);
    });
    assertAssetPath(entry.flyer, file, 'flyer');
    assertHttpsUrl(entry.lineUrl, file, 'lineUrl');
    assertLocalUrl(entry.contactUrl, file, 'contactUrl');
    return entry;
  }));
  const publishedRecruitment = recruitmentEntries
    .filter((entry) => entry.published)
    .sort((a, b) => b.year - a.year)[0];
  if (!publishedRecruitment) throw new Error('公開中の新歓情報がありません。');
  await replaceGenerated('join.html', 'recruitment', renderRecruitment(publishedRecruitment));

  console.log(`Generated ${news.length} news pages, ${archivedConcerts.length} archived concerts, ${upcomingConcerts.length} upcoming concert(s), ${Math.min(videoArchive.videos.length, 30)} videos, and recruitment for ${publishedRecruitment.year}.`);
}

await build();

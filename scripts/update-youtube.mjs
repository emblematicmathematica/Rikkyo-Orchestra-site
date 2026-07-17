import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const channelHandle = 'RUSOChannel';
const channelUrl = `https://www.youtube.com/@${channelHandle}/videos`;
const response = await fetch(channelUrl, {
  headers: {
    'accept-language': 'ja-JP,ja;q=0.9,en;q=0.7',
    'user-agent': 'Mozilla/5.0 (compatible; RikkyoOrchestraSite/1.0)',
  },
});

if (!response.ok) {
  throw new Error(`YouTube動画一覧の取得に失敗しました: ${response.status}`);
}

const html = await response.text();
const videoPattern = /accessibilityContext":\{"label":"((?:\\.|[^"\\])*)"\}[\s\S]{0,2400}?watchEndpoint":\{"videoId":"([A-Za-z0-9_-]{11})"/g;
const videos = [];
const seenVideoIds = new Set();
let match;

while ((match = videoPattern.exec(html)) && videos.length < 30) {
  const [, encodedLabel, videoId] = match;
  if (seenVideoIds.has(videoId)) continue;

  seenVideoIds.add(videoId);
  const label = JSON.parse(`"${encodedLabel}"`);
  const durationMatch = label.match(/\s((?:\d+\s*時間\s*)?(?:\d+\s*分)(?:\s*\d+\s*秒)?)$/);
  const duration = durationMatch?.[1] || '';
  const title = durationMatch ? label.slice(0, durationMatch.index).trim() : label.trim();

  videos.push({
    videoId,
    title,
    duration,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  });
}

if (videos.length === 0) {
  throw new Error('YouTubeの公開動画を取得できませんでした。ページ構造が変わった可能性があります。');
}

const output = {
  channelUrl,
  updatedAt: new Date().toISOString(),
  limit: 30,
  videos,
};

await writeFile(path.join(root, 'content/videos.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Updated ${videos.length} YouTube videos.`);

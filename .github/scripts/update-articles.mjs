// note.com の RSS フィードを取得し、最新記事を articles.json として書き出すスクリプト。
// GitHub Actions (.github/workflows/update-articles.yml) から定期的に実行される。

const NOTE_USERNAME = 'aoao_works';
const RSS_URL = `https://note.com/${NOTE_USERNAME}/rss`;
const OUTPUT_PATH = new URL('../../articles.json', import.meta.url);
const MAX_ARTICLES = 3;
const EXCERPT_LENGTH = 90;

function stripCData(value) {
  const match = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return (match ? match[1] : value).trim();
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? stripCData(match[1]) : '';
}

function toExcerpt(description) {
  const text = decodeEntities(description.replace(/<[^>]+>/g, ''))
    .replace(/続きをみる\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= EXCERPT_LENGTH) return text;
  return text.slice(0, EXCERPT_LENGTH) + '…';
}

function toDateOnly(pubDate) {
  const parsed = new Date(pubDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

async function main() {
  const res = await fetch(RSS_URL, { headers: { 'User-Agent': 'aoao-works-site-bot' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch RSS feed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();

  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const articles = itemBlocks.slice(0, MAX_ARTICLES).map(block => ({
    title: decodeEntities(extractTag(block, 'title')),
    link: extractTag(block, 'link'),
    thumbnail: extractTag(block, 'media:thumbnail'),
    pubDate: toDateOnly(extractTag(block, 'pubDate')),
    excerpt: toExcerpt(extractTag(block, 'description')),
  })).filter(article => article.title && article.link);

  if (articles.length === 0) {
    throw new Error('No articles parsed from RSS feed — aborting to avoid overwriting articles.json with empty data.');
  }

  const fs = await import('node:fs/promises');
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(articles, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${articles.length} articles to articles.json`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

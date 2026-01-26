/**
 * Generates RSS feed from writings index
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ducksquack.com';
const SITE_TITLE = 'DuckSquack';
const SITE_DESCRIPTION = 'Essays on AI, Technology & Society by Tim Hughes';

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRss() {
  const indexPath = path.join(__dirname, '../public/writings/index.json');
  const writings = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  const now = new Date().toUTCString();

  const items = writings.map(post => {
    const pubDate = new Date(post.date).toUTCString();
    const link = `${SITE_URL}/#/writings/${post.slug}`;

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.synopsis || post.preview)}</description>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-au</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  const outputPath = path.join(__dirname, '../public/rss.xml');
  fs.writeFileSync(outputPath, rss);
  console.log('RSS feed generated:', outputPath);
}

generateRss();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content/writings');
const OUTPUT_DIR = path.join(__dirname, '../public/writings');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getPreview(content, maxLength = 150) {
  // Get first meaningful paragraph, truncate to maxLength
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const preview = lines.slice(0, 3).join(' ').trim();

  if (preview.length > maxLength) {
    return preview.substring(0, maxLength - 3) + '...';
  }
  return preview;
}

function processWritings() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const writings = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const slug = createSlug(data.title);
    const writing = {
      title: data.title,
      date: data.date,
      color: data.color || 'blue',
      slug,
      preview: getPreview(content)
    };

    writings.push(writing);

    // Write individual post JSON
    const postData = {
      ...writing,
      content: content.trim()
    };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${slug}.json`),
      JSON.stringify(postData, null, 2)
    );

    console.log(`Generated: ${slug}.json`);
  }

  // Sort by date (newest first)
  writings.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write index file (metadata only, no content)
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(writings, null, 2)
  );

  console.log(`\nGenerated index.json with ${writings.length} writings`);
}

processWritings();

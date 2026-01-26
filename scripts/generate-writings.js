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

function getWordCount(content) {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function getPreview(content, maxLength = 150) {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const preview = lines.slice(0, 3).join(' ').trim();

  if (preview.length > maxLength) {
    return preview.substring(0, maxLength - 3) + '...';
  }
  return preview;
}

// AI-generated synopses for each essay
const SYNOPSES = {
  'escape-velocity': 'Argues that China has achieved structural advantages in AI development through manufacturing dominance, energy capacity, and civil-military integration that may prove insurmountable.',
  'sandpapering-our-structural-decay': 'Critiques Australia\'s misplaced priorities, comparing national outrage over cricket cheating to indifference toward economic decline and squandered natural resources.',
  'navigating-the-mad-map-mutual-assured-destruction-vs-mutual-assured-prosperity': 'Presents two possible AI futures: Mutual Assured Destruction through conflict and fragmentation, or Mutual Assured Prosperity through cooperation.',
  'parenthood-in-the-age-of-super-intelligence': 'Reflects on becoming a father during the AI revolution, exploring how to prepare a child for a world where traditional education and work are being transformed.',
  'reverse-engineering-nature-s-quantum': 'Explores how quantum phenomena already pervade biology, suggesting we are catching up to computational processes that have existed for billions of years.',
  'the-last-normal-tuesday': 'Examines Australia\'s housing bubble, manufacturing collapse, and AI-driven job displacement, arguing that unprecedented economic disruption is imminent.',
  'the-rerun-of-rome': 'A 2011 essay comparing American structural patterns to late Rome: currency debasement, military overextension, infrastructure decay, and declining civic virtue.',
  'the-rustle-in-the-grass': 'A fifteen-year follow-up finding that warning signs have intensified and patterns of imperial decline have become more pronounced.',
  'the-system-is-already-dead': 'A personal account of navigating systemic failure through chronic illness, arguing we must build for continuity rather than recovery.',
  'the-widening-gyre': 'Examines the growing divide between AI insiders and outsiders, warning that the gap in tacit knowledge compounds daily and may become unbridgeable.',
  'a-prosthetic-for-empathy': 'Explores what happens when AI moves beyond imitating love to understanding its shape, and whether machines can extend human connection.',
  'the-inheritance-cliff': 'Examines how parental wealth has become the primary determinant of home ownership in Australia, arguing we have constructed a de facto aristocracy while maintaining democratic forms.',
  'the-death-of-the-junior-role': 'Argues that AI is eliminating entry-level positions across professions, severing the apprenticeship pipeline through which expertise has traditionally been transmitted.',
  'what-does-australia-actually-make': 'Catalogues Australia\'s manufacturing collapse and strategic vulnerabilities, arguing we have become a mine with a housing bubble attached through deliberate policy failure.',
  'teaching-arthur': 'A father\'s curriculum for his son: practical skills, critical thinking, kindness with boundaries, and the lesson that you are stronger than you believe.',
  'the-meaning-void': 'Asks what happens to meaning when work disappears, suggesting the answer may involve returning to older sources of identity: community, presence, and local contribution.',
  'the-chronic-patient-and-the-algorithm': 'Fifteen years of healthcare system failures examined through the lens of chronic illness, exploring how AI might fix informational failures while human presence remains irreplaceable.',
  'digital-sovereignty': 'Examines Australia\'s dependence on foreign-controlled digital infrastructure, asking what sovereignty means when critical systems are owned by others.',
  'the-loneliness-dividend': 'Explores how loneliness has become an industry, with AI companions as the latest product that addresses the symptom while leaving the underlying causes untouched.'
};

function processWritings() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const writings = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const slug = createSlug(data.title);
    const wordCount = getWordCount(content);
    const synopsis = SYNOPSES[slug] || getPreview(content);

    const writing = {
      title: data.title,
      date: data.date,
      color: data.color || 'blue',
      slug,
      wordCount,
      synopsis,
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

    console.log(`Generated: ${slug}.json (${wordCount} words)`);
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

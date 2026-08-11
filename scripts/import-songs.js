import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';

const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');
const WRITINGS_INDEX_PATH = path.join(process.cwd(), 'public/writings/index.json');
const SONGS_DIR = path.join(process.cwd(), 'public/songs');
const SONGS_INDEX_PATH = path.join(SONGS_DIR, 'index.json');
const TARGET_BITRATE = '128k';

const SONG_MAPPINGS = [
  {
    sourceFile: 'Energy Epoch - Level 2.mp3',
    essaySlug: 'the-energy-epoch',
    songTitle: 'Level 2',
  },
  {
    sourceFile: 'Rustle in the grass - Imperial rerun.mp3',
    essaySlug: 'the-rustle-in-the-grass',
    songTitle: 'Imperial rerun',
  },
  {
    sourceFile: 'The Glitter in the Machine.mp3',
    essaySlug: 'the-fixed-point',
    songTitle: 'The Glitter in the Machine',
  },
  {
    sourceFile: 'board resolves - Kardashev Tuesday.mp3',
    essaySlug: 'the-board-resolves',
    songTitle: 'Kardashev Tuesday',
  },
  {
    sourceFile: 'bomb-built - Caelum.mp3',
    essaySlug: 'the-bomb-has-been-built',
    songTitle: 'Caelum',
  },
  {
    sourceFile: 'nice days later - Straight to hell.mp3',
    essaySlug: 'nine-days-later',
    songTitle: 'Straight to Hell',
  },
  {
    sourceFile: 'widening gyre - Compound Fracture.mp3',
    essaySlug: 'the-widening-gyre',
    songTitle: 'Compound Fracture',
  },
];

function createSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function clearGeneratedSongs(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  for (const fileName of fs.readdirSync(dirPath)) {
    if (fileName.endsWith('.mp3')) {
      fs.unlinkSync(path.join(dirPath, fileName));
    }
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function probeMp3(filePath) {
  let raw;

  try {
    raw = execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration,size,bit_rate',
        '-of',
        'json',
        filePath,
      ],
      { encoding: 'utf8' }
    );
  } catch (error) {
    if (error?.stdout) {
      raw = error.stdout;
    } else {
      throw error;
    }
  }

  const parsed = JSON.parse(raw);
  const format = parsed.format || {};

  return {
    duration: Math.round(Number(format.duration || 0)),
    size: Number(format.size || 0),
    bitRate: Number(format.bit_rate || 0),
  };
}

function compressSong(sourcePath, outputPath, metadata) {
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      sourcePath,
      '-vn',
      '-map_metadata',
      '-1',
      '-codec:a',
      'libmp3lame',
      '-b:a',
      TARGET_BITRATE,
      '-ar',
      '44100',
      '-ac',
      '2',
      '-metadata',
      `title=${metadata.songTitle}`,
      '-metadata',
      'artist=Tim Hughes',
      '-metadata',
      'album=DuckSquack Songs',
      outputPath,
    ],
    { stdio: 'inherit' }
  );
}

function buildSongsIndex() {
  if (!fs.existsSync(WRITINGS_INDEX_PATH)) {
    throw new Error(`Missing writings index at ${WRITINGS_INDEX_PATH}. Run npm run generate:writings first.`);
  }

  const writings = readJson(WRITINGS_INDEX_PATH);
  const writingBySlug = new Map(writings.map((writing) => [writing.slug, writing]));

  ensureDir(SONGS_DIR);
  clearGeneratedSongs(SONGS_DIR);

  const importedSongs = [];

  for (const entry of SONG_MAPPINGS) {
    const sourcePath = path.join(DOWNLOADS_DIR, entry.sourceFile);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Missing source song: ${sourcePath}`);
    }

    const writing = writingBySlug.get(entry.essaySlug);
    if (!writing) {
      throw new Error(`Unknown essay slug in song mapping: ${entry.essaySlug}`);
    }

    const songSlug = createSlug(entry.songTitle);
    const outputFile = `${entry.essaySlug}-${songSlug}.mp3`;
    const outputPath = path.join(SONGS_DIR, outputFile);

    console.log(`Compressing ${entry.sourceFile} -> ${outputFile}`);
    compressSong(sourcePath, outputPath, entry);

    const stats = probeMp3(outputPath);
    importedSongs.push({
      essaySlug: entry.essaySlug,
      essayTitle: writing.title,
      title: entry.songTitle,
      slug: songSlug,
      fileName: outputFile,
      url: `/songs/${outputFile}`,
      duration: stats.duration,
      size: stats.size,
      bitRate: stats.bitRate,
    });
  }

  importedSongs.sort((a, b) => {
    const aWriting = writingBySlug.get(a.essaySlug);
    const bWriting = writingBySlug.get(b.essaySlug);
    return new Date(bWriting.date) - new Date(aWriting.date);
  });

  fs.writeFileSync(SONGS_INDEX_PATH, JSON.stringify(importedSongs, null, 2));
  console.log(`Wrote ${importedSongs.length} songs to ${SONGS_INDEX_PATH}`);
}

buildSongsIndex();

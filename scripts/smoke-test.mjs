import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const distDirectory = resolve('dist');
const requiredFiles = [
  'index.html',
  'main.bundle.js',
  'css/game.css',
  'manifest.json',
  'sw.js',
  'icons/icon-192.svg',
];

for (const file of requiredFiles) {
  if (!existsSync(join(distDirectory, file))) {
    throw new Error(`Missing production asset: ${file}`);
  }
}

const indexHtml = readFileSync(join(distDirectory, 'index.html'), 'utf8');
const referencedAssets = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((asset) => !asset.startsWith('http'));

for (const asset of referencedAssets) {
  const normalizedAsset = asset.replace(/^\//, '');
  if (!existsSync(join(distDirectory, normalizedAsset))) {
    throw new Error(`HTML references missing asset: ${asset}`);
  }
}

const manifest = JSON.parse(readFileSync(join(distDirectory, 'manifest.json'), 'utf8'));
if (!manifest.name || !manifest.start_url) {
  throw new Error('Manifest is missing required name or start_url');
}

const serviceWorker = readFileSync(join(distDirectory, 'sw.js'), 'utf8');
if (!serviceWorker.includes('CACHE_NAME')) {
  throw new Error('Service worker does not define a cache');
}

console.log(`Production smoke check passed: ${requiredFiles.length} assets verified.`);

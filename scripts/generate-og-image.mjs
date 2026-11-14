// Generates public/og-image.png (1200×630) from public/logo.png.
// Run: node scripts/generate-og-image.mjs   (sharp ships with Next.js, no extra install)
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;
const SITE_NAME = 'nhatphanhk102';
const TAGLINE = 'Software Engineer · Projects, Blog &amp; Resume';

const logo = await sharp(readFileSync(resolve(root, 'public/logo.png')))
  .resize({ width: 380, height: 380, fit: 'inside' })
  .png()
  .toBuffer();
const { width: logoW = 380, height: logoH = 380 } = await sharp(logo).metadata();

const textX = 90 + logoW + 70;
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="#f59e0b"/>
  <text x="${textX}" y="300" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="68" font-weight="800" fill="#f8fafc">${SITE_NAME}</text>
  <text x="${textX}" y="360" font-family="Inter, 'Segoe UI', Arial, sans-serif" font-size="30" font-weight="500" fill="#fbbf24">${TAGLINE}</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 90, top: Math.round((H - logoH) / 2) }])
  .png({ compressionLevel: 9 })
  .toFile(resolve(root, 'public/og-image.png'));

// eslint-disable-next-line no-console
console.log(`Wrote public/og-image.png (${W}×${H}, logo ${logoW}×${logoH})`);

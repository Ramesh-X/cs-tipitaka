#!/usr/bin/env node
// One-off generator for favicon/app-icon/OG-image raster assets, run manually
// whenever apps/web/public/icon.svg or the OG card design changes:
//   node apps/web/scripts/generate-icons.mjs
//   pnpm dlx png-to-ico apps/web/public/.icon-256.png > apps/web/public/favicon.ico
//   rm apps/web/public/.icon-256.png
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../public/', import.meta.url);
const BRAND_BG = '#1A0A00';
const outPath = (name) => fileURLToPath(new URL(name, root));

const iconSvg = await readFile(new URL('icon.svg', root));

async function renderIcon(size, outFile) {
  await sharp(iconSvg, { density: Math.ceil((72 * size) / 100) })
    .resize(size, size)
    .flatten({ background: BRAND_BG })
    .png()
    .toFile(outPath(outFile));
  console.log(`wrote ${outFile} (${size}x${size})`);
}

await renderIcon(180, 'apple-touch-icon.png');
await renderIcon(192, 'icon-192.png');
await renderIcon(512, 'icon-512.png');
// Intermediate 256x256 source for png-to-ico (deleted by the caller after
// the CLI step above runs — png-to-ico derives 48/32/16 from this).
await renderIcon(256, '.icon-256.png');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const GOLD = '#F5C242';
const FONT_STACK = "Georgia, 'DejaVu Serif', serif";

// Dharma-wheel motif re-derived from icon.svg's 100x100 local coordinate
// space (disc r=49, rim r=43, 8 spokes, hub r=8), recentered/scaled here.
const wheelGroup = (cx, cy, scale) => `
  <g transform="translate(${cx}, ${cy}) scale(${scale}) translate(-50, -50)">
    <circle cx="50" cy="50" r="49" fill="${BRAND_BG}" stroke="${GOLD}" stroke-width="1.5" />
    <circle cx="50" cy="50" r="43" fill="none" stroke="${GOLD}" stroke-width="5.5" />
    <line x1="50" y1="39" x2="50" y2="10" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="57.78" y1="42.22" x2="78.28" y2="21.72" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="61" y1="50" x2="90" y2="50" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="57.78" y1="57.78" x2="78.28" y2="78.28" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="50" y1="61" x2="50" y2="90" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="42.22" y1="57.78" x2="21.72" y2="78.28" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="39" y1="50" x2="10" y2="50" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <line x1="42.22" y1="42.22" x2="21.72" y2="21.72" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" />
    <circle cx="50" cy="50" r="8" fill="${GOLD}" />
  </g>`;

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${BRAND_BG}" />
  ${wheelGroup(OG_WIDTH / 2, 168, 2.15)}
  <text x="${OG_WIDTH / 2}" y="368" text-anchor="middle" font-family="${FONT_STACK}" font-size="96" fill="${GOLD}">Tipiṭaka</text>
  <text x="${OG_WIDTH / 2}" y="420" text-anchor="middle" font-family="${FONT_STACK}" font-size="32" fill="#F0DDB8">The Pāli Canon — Chaṭṭha Saṅgāyana (CST)</text>
  <text x="${OG_WIDTH / 2}" y="588" text-anchor="middle" font-family="${FONT_STACK}" font-size="22" fill="#B99A63">CC0 · Public Domain</text>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(outPath('og-image.png'));
console.log(`wrote og-image.png (${OG_WIDTH}x${OG_HEIGHT})`);

const manifest = {
  name: 'Tipiṭaka — The Pāli Canon',
  short_name: 'Tipiṭaka',
  start_url: '/',
  display: 'browser',
  background_color: BRAND_BG,
  theme_color: BRAND_BG,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
await writeFile(
  new URL('manifest.webmanifest', root),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log('wrote manifest.webmanifest');

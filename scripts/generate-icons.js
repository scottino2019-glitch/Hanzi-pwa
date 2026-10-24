import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to generate a simple uncompressed/deflated RGBA PNG
function createPng(width, height, drawFn) {
  // RGBA buffer with 1 filter byte per row
  const rowBytes = width * 4;
  const buffer = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    buffer[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(buffer);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw red vermillion gradient with Hanzi symbol "字" (character) / gold seal
function drawIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const maxR = w / 2;

  // Background: Imperial Chinese lacquer red gradient (#c53030 to #9b2c2c)
  const normY = y / h;
  const normX = x / w;
  const rBase = Math.round(197 - normY * 30 + normX * 10);
  const gBase = Math.round(48 - normY * 15);
  const bBase = Math.round(48 - normY * 15);

  // For non-maskable icons, give a smooth rounded squircle corner
  if (!isMaskable) {
    const cornerR = w * 0.22;
    // Check if within rounded rect
    const qx = Math.max(0, Math.abs(x - cx) - (w / 2 - cornerR));
    const qy = Math.max(0, Math.abs(y - cy) - (h / 2 - cornerR));
    const cornerDist = Math.sqrt(qx * qx + qy * qy);
    if (cornerDist > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
    if (cornerDist > cornerR - 1.5) {
      const alpha = Math.max(0, Math.min(255, Math.round((cornerR - cornerDist + 1.5) / 1.5 * 255)));
      return [rBase, gBase, bBase, alpha];
    }
  }

  // Golden inner border
  const borderMargin = w * (isMaskable ? 0.16 : 0.08);
  const innerW = w - borderMargin * 2;
  const innerH = h - borderMargin * 2;
  const inBorder = (
    (x >= borderMargin && x <= borderMargin + 3 && y >= borderMargin && y <= h - borderMargin) ||
    (x >= w - borderMargin - 3 && x <= w - borderMargin && y >= borderMargin && y <= h - borderMargin) ||
    (y >= borderMargin && y <= borderMargin + 3 && x >= borderMargin && x <= w - borderMargin) ||
    (y >= h - borderMargin - 3 && y <= h - borderMargin && x >= borderMargin && x <= w - borderMargin)
  );

  if (inBorder) {
    return [246, 173, 85, 230]; // Warm gold border
  }

  // Draw simplified representation of ideogram "文" or "人" or "学" in center
  // Let's create an elegant stylized brush stroke pattern in center
  const scale = (isMaskable ? 0.6 : 0.75) * (w / 100);
  const nx = (x - cx) / scale;
  const ny = (y - cy) / scale;

  // Let's draw character '字' (Zì - ideogram/writing):
  // Dot on top: ny in [-32, -24], nx in [-4, 4]
  const isTopDot = (nx * nx + (ny + 28) * (ny + 28) <= 25);
  // Roof horizontal: ny around -18, nx in [-24, 24]
  const isRoofTop = (ny >= -20 && ny <= -15 && nx >= -26 && nx <= 26);
  // Roof left hook: nx around -24, ny in [-18, -10]
  const isRoofLeft = (nx >= -26 && nx <= -21 && ny >= -18 && ny <= -10);
  // Roof right hook: nx around 24, ny in [-18, -10]
  const isRoofRight = (nx >= 21 && nx <= 26 && ny >= -18 && ny <= -10);
  
  // Child / Zi element inside:
  // Top hook / horizontal: ny around -5, nx in [-15, 15]
  const isInnerH = (ny >= -7 && ny <= -3 && nx >= -16 && nx <= 16);
  // Curved vertical spine: nx around 0, ny in [-5, 25]
  const isInnerV = (Math.abs(nx - (ny > 10 ? (ny - 10) * 0.3 : 0)) <= 3.5 && ny >= -5 && ny <= 25);
  // Horizontal crossbar: ny around 8, nx in [-22, 22]
  const isCross = (ny >= 6 && ny <= 10 && nx >= -22 && nx <= 22);
  // Hook at bottom: ny around 25, nx in [-2, 8]
  const isHook = (ny >= 22 && ny <= 26 && nx >= -4 && nx <= 10);

  if (isTopDot || isRoofTop || isRoofLeft || isRoofRight || isInnerH || isInnerV || isCross || isHook) {
    return [255, 255, 255, 255]; // Crisp white character strokes
  }

  return [rBase, gBase, bBase, 255];
}

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPng(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPng(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleIcon = createPng(180, 180, (x, y, w, h) => drawIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Also generate public/icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e53e3e" />
      <stop offset="100%" stop-color="#9b2c2c" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)" />
  <rect x="36" y="36" width="440" height="440" rx="70" fill="none" stroke="#f6ad55" stroke-width="6" opacity="0.8" />
  <text x="50%" y="60%" font-family="system-ui, -apple-system, sans-serif, 'Noto Sans SC'" font-size="280" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">字</text>
  <text x="50%" y="88%" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="600" fill="#fbd38d" text-anchor="middle" letter-spacing="4">HANZI PWA</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

console.log('All icons generated successfully!');

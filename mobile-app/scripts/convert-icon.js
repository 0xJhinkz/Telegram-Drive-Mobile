/**
 * convert-icon.js
 * Converts the JPEG icon files to real PNG format.
 * Run with: node scripts/convert-icon.js
 *
 * Uses only Node.js built-ins — no extra packages required.
 */
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// We'll create a proper 1024x1024 PNG programmatically
// using the Telegram Drive brand colors
const WIDTH  = 1024;
const HEIGHT = 1024;

// ── PNG encoding helpers ─────────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len       = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crc    = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

function makePNG(width, height, pixelFn) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 2;  // color type: RGB
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Raw image data (filter byte 0 per scanline)
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 3);
    row[0] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      row[1 + x * 3]     = r;
      row[1 + x * 3 + 1] = g;
      row[1 + x * 3 + 2] = b;
    }
    rawRows.push(row);
  }
  const raw  = Buffer.concat(rawRows);
  const idat = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Draw the Telegram Drive icon ──────────────────────────────────────────────

function pixelFn(x, y) {
  const cx = WIDTH  / 2;
  const cy = HEIGHT / 2;
  const r  = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  // Background: dark navy #0a0f1e
  const BG  = [10,  15, 30];
  // Circle fill: Telegram blue gradient #2AABEE → #229ED9
  const BLUE_OUTER = [34, 158, 217];
  const BLUE_INNER = [42, 171, 238];

  const CIRCLE_R = 420;
  const INNER_R  = 300;

  if (r > CIRCLE_R) return BG;

  // Anti-alias at circle edge
  const edge = CIRCLE_R - r;
  const t     = Math.min(1, Math.max(0, edge / 3));

  // Gradient from inner to outer blue
  const gr = t * (r < INNER_R ? BLUE_INNER[0] : BLUE_OUTER[0]) + (1 - t) * BG[0];
  const gg = t * (r < INNER_R ? BLUE_INNER[1] : BLUE_OUTER[1]) + (1 - t) * BG[1];
  const gb = t * (r < INNER_R ? BLUE_INNER[2] : BLUE_OUTER[2]) + (1 - t) * BG[2];

  // Paper plane shape (simple triangle pointing right)
  // Points: tip=(cx+260,cy), tail-top=(cx-220,cy-200), tail-bot=(cx-220,cy+200)
  // Also a folded-back lower wing: (cx-220,cy+200),(cx+60,cy+40),(cx-220,cy)
  const inPlane  = isInTriangle(x, y, cx+260,cy, cx-220,cy-200, cx+60,cy+40);
  const inWing   = isInTriangle(x, y, cx-220,cy, cx+60,cy+40,   cx-220,cy+200);

  if (inPlane) {
    // White plane body
    const blend = Math.min(1, (CIRCLE_R - r) / 80);
    return [
      Math.round(200 + blend * 55),
      Math.round(220 + blend * 35),
      Math.round(230 + blend * 25),
    ];
  }
  if (inWing) {
    // Slightly lighter blue fold
    return [60, 180, 230];
  }

  return [Math.round(gr), Math.round(gg), Math.round(gb)];
}

function sign(ax, ay, bx, by, cx, cy) {
  return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
}
function isInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = sign(px, py, ax, ay, bx, by);
  const d2 = sign(px, py, bx, by, cx, cy);
  const d3 = sign(px, py, cx, cy, ax, ay);
  const neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(neg && pos);
}

// ── Generate and save ─────────────────────────────────────────────────────────

console.log('Generating 1024×1024 PNG icon…');
const png = makePNG(WIDTH, HEIGHT, pixelFn);

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const iconPath    = path.join(assetsDir, 'icon.png');
const adaptivePath= path.join(assetsDir, 'adaptive-icon.png');

fs.writeFileSync(iconPath,     png);
fs.writeFileSync(adaptivePath, png);

console.log('✅ Written:', iconPath);
console.log('✅ Written:', adaptivePath);
console.log(`   Size: ${(png.length / 1024).toFixed(1)} KB`);

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '..', process.argv[2] || 'web-build');
const publicDir = path.resolve(__dirname, '..', 'public');
const publicFontsDir = path.resolve(publicDir, 'fonts');
const buildFontsDir = path.resolve(buildDir, 'fonts');

if (!fs.existsSync(publicFontsDir)) {
  console.error(`Public fonts directory not found: ${publicFontsDir}`);
  console.error('Run "npm run postinstall" first to copy fonts.');
  process.exit(1);
}

// Copy fonts to build output
fs.mkdirSync(buildFontsDir, { recursive: true });

const fontFiles = fs.readdirSync(publicFontsDir).filter((name) => name.endsWith('.ttf'));

fontFiles.forEach((file) => {
  const src = path.join(publicFontsDir, file);
  const dest = path.join(buildFontsDir, file);
  fs.copyFileSync(src, dest);
});

console.log(`Copied ${fontFiles.length} font files to ${buildFontsDir}`);

// Copy Cloudflare Pages config files from public/ root to build output
const publicRootFiles = ['_redirects', '_headers'];
publicRootFiles.forEach((file) => {
  const src = path.resolve(publicDir, file);
  const dest = path.resolve(buildDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to build output`);
  }
});

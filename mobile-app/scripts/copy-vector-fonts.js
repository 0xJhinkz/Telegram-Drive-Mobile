const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const assetsDir = path.resolve(__dirname, '..', 'assets', 'fonts');
const publicDir = path.resolve(__dirname, '..', 'public', 'fonts');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source fonts directory not found: ${sourceDir}`);
  process.exit(1);
}

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const fontFiles = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.ttf'));

fontFiles.forEach((file) => {
  const src = path.join(sourceDir, file);
  const destAssets = path.join(assetsDir, file);
  const destPublic = path.join(publicDir, file);
  fs.copyFileSync(src, destAssets);
  fs.copyFileSync(src, destPublic);
});

console.log(`Copied ${fontFiles.length} vector icon font files to ${assetsDir} and ${publicDir}`);


const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
const targetDir = path.resolve(__dirname, '..', 'assets', 'fonts');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source fonts directory not found: ${sourceDir}`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

const fontFiles = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.ttf'));

fontFiles.forEach((file) => {
  const src = path.join(sourceDir, file);
  const dest = path.join(targetDir, file);
  fs.copyFileSync(src, dest);
});

console.log(`Copied ${fontFiles.length} vector icon font files to ${targetDir}`);

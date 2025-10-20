const path = require('path');
const sharp = require('sharp');
const inputPath = path.join(__dirname, '../icon.png');
const outputPath = path.join(__dirname, '../public/favicon.ico');

async function generateFavicon() {
  await sharp(inputPath).resize(32, 32).png().toFile(outputPath);
  console.log('Generated favicon.ico');
}

generateFavicon();

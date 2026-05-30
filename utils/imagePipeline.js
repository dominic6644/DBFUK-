const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = '/var/data/uploads';

function ensureDirs() {
  ['original', 'large', 'medium', 'small'].forEach(dir => {
    const full = path.join(uploadDir, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  });
}

async function processImage(filePath) {
  ensureDirs();

  const id = uuidv4();
  const baseName = id + '.webp';

  const originalOut = path.join(uploadDir, 'original', baseName);
  const largeOut = path.join(uploadDir, 'large', baseName);
  const mediumOut = path.join(uploadDir, 'medium', baseName);
  const smallOut = path.join(uploadDir, 'small', baseName);

  // 1. Save original (compressed slightly)
  await sharp(filePath)
    .webp({ quality: 85 })
    .toFile(originalOut);

  // 2. Large (hero image - LCP focus)
  await sharp(filePath)
    .resize(1200)
    .webp({ quality: 80 })
    .toFile(largeOut);

  // 3. Medium (article body)
  await sharp(filePath)
    .resize(768)
    .webp({ quality: 75 })
    .toFile(mediumOut);

  // 4. Small (thumbnails / previews)
  await sharp(filePath)
    .resize(400)
    .webp({ quality: 70 })
    .toFile(smallOut);

  return {
    original: `/uploads/original/${baseName}`,
    large: `/uploads/large/${baseName}`,
    medium: `/uploads/medium/${baseName}`,
    small: `/uploads/small/${baseName}`
  };
}

module.exports = { processImage };

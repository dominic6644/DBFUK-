const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = '/var/data/uploads';

function ensureDirs() {
  const folders = ['original', 'large', 'medium', 'small'];

  for (const folder of folders) {
    const dir = path.join(uploadDir, folder);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Created folder:', dir);
    }
  }
}

async function processImage(filePath) {
  ensureDirs();

  const fileName = `${uuidv4()}.webp`;

  const originalOut = path.join(uploadDir, 'original', fileName);
  const largeOut = path.join(uploadDir, 'large', fileName);
  const mediumOut = path.join(uploadDir, 'medium', fileName);
  const smallOut = path.join(uploadDir, 'small', fileName);

  try {
    await sharp(filePath)
      .webp({ quality: 85 })
      .toFile(originalOut);

    await sharp(filePath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(largeOut);

    await sharp(filePath)
      .resize(768, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(mediumOut);

    await sharp(filePath)
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 70 })
      .toFile(smallOut);

    return {
      original: `/uploads/original/${fileName}`,
      large: `/uploads/large/${fileName}`,
      medium: `/uploads/medium/${fileName}`,
      small: `/uploads/small/${fileName}`
    };

  } catch (err) {
    console.error('IMAGE PIPELINE ERROR:', err);
    throw err;
  }
}

module.exports = { processImage };

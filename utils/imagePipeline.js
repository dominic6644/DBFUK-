const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Render disk path
const uploadDir = process.env.UPLOAD_DIR || '/var/data/uploads';

function ensureDirs() {
try {
// Create base uploads folder
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
console.log('Created upload directory:', uploadDir);
}

```
// Create image size folders
['original', 'large', 'medium', 'small'].forEach(dir => {
  const fullPath = path.join(uploadDir, dir);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log('Created directory:', fullPath);
  }
});
```

} catch (err) {
console.error('Failed creating upload directories:', err);
throw err;
}
}

async function processImage(filePath) {
ensureDirs();

const imageId = uuidv4();
const fileName = `${imageId}.webp`;

const originalOut = path.join(uploadDir, 'original', fileName);
const largeOut = path.join(uploadDir, 'large', fileName);
const mediumOut = path.join(uploadDir, 'medium', fileName);
const smallOut = path.join(uploadDir, 'small', fileName);

console.log('Processing image:', filePath);
console.log('Saving original:', originalOut);
console.log('Saving large:', largeOut);
console.log('Saving medium:', mediumOut);
console.log('Saving small:', smallOut);

try {
// Original
await sharp(filePath)
.webp({ quality: 85 })
.toFile(originalOut);

```
// Large
await sharp(filePath)
  .resize({
    width: 1200,
    withoutEnlargement: true
  })
  .webp({ quality: 80 })
  .toFile(largeOut);

// Medium
await sharp(filePath)
  .resize({
    width: 768,
    withoutEnlargement: true
  })
  .webp({ quality: 75 })
  .toFile(mediumOut);

// Small
await sharp(filePath)
  .resize({
    width: 400,
    withoutEnlargement: true
  })
  .webp({ quality: 70 })
  .toFile(smallOut);

// Verify files actually exist
console.log('Original exists:', fs.existsSync(originalOut));
console.log('Large exists:', fs.existsSync(largeOut));
console.log('Medium exists:', fs.existsSync(mediumOut));
console.log('Small exists:', fs.existsSync(smallOut));

return {
  original: `/uploads/original/${fileName}`,
  large: `/uploads/large/${fileName}`,
  medium: `/uploads/medium/${fileName}`,
  small: `/uploads/small/${fileName}`
};
```

} catch (err) {
console.error('Image processing failed:', err);
throw err;
}
}

module.exports = { processImage };

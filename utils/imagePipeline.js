const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Render persistent disk location
const uploadDir = '/var/data/uploads';

function ensureDirs() {
// Create base uploads folder
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
}

// Create image size folders
const folders = ['original', 'large', 'medium', 'small'];

folders.forEach(folder => {
const folderPath = path.join(uploadDir, folder);

```
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log('Created folder:', folderPath);
}
```

});
}

async function processImage(filePath) {
ensureDirs();

const fileName = `${uuidv4()}.webp`;

const originalOut = path.join(uploadDir, 'original', fileName);
const largeOut = path.join(uploadDir, 'large', fileName);
const mediumOut = path.join(uploadDir, 'medium', fileName);
const smallOut = path.join(uploadDir, 'small', fileName);

console.log('Processing image:', filePath);
console.log('Saving to:', originalOut);

try {
// Original
await sharp(filePath)
.webp({ quality: 85 })
.toFile(originalOut);

```
// Large (1200px)
await sharp(filePath)
  .resize({
    width: 1200,
    withoutEnlargement: true
  })
  .webp({ quality: 80 })
  .toFile(largeOut);

// Medium (768px)
await sharp(filePath)
  .resize({
    width: 768,
    withoutEnlargement: true
  })
  .webp({ quality: 75 })
  .toFile(mediumOut);

// Small (400px)
await sharp(filePath)
  .resize({
    width: 400,
    withoutEnlargement: true
  })
  .webp({ quality: 70 })
  .toFile(smallOut);

console.log('Original exists:', fs.existsSync(originalOut));
console.log('Large exists:', fs.existsSync(largeOut));
console.log('Medium exists:', fs.existsSync(mediumOut));
console.log('Small exists:', fs.existsSync(smallOut));

return {
  original: '/uploads/original/' + fileName,
  large: '/uploads/large/' + fileName,
  medium: '/uploads/medium/' + fileName,
  small: '/uploads/small/' + fileName
};
```

} catch (err) {
console.error('Image processing error:', err);
throw err;
}
}

module.exports = {
processImage
};

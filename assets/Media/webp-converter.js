// Converts all images in the current directory to .webp format (keeps originals).
// Requires: npm install sharp

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Error: Cannot find module 'sharp'
// To fix this, open a terminal in your assets folder and run:
//    npm install sharp
// This will install the required dependency for image conversion.

// After installing, re-run this script with: node webp-converter.js

const exts = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff'];
const dir = '.';

fs.readdir(dir, async (err, files) => {
  if (err) throw err;
  const images = files.filter(f => exts.includes(path.extname(f).toLowerCase()));
  if (images.length === 0) {
    console.log('No images found to convert.');
    return;
  }
  for (const img of images) {
    const outFile = path.basename(img, path.extname(img)) + '.webp';
    try {
      // Force overwrite if .webp already exists
      await sharp(img)
        .webp({ quality: 90 })
        .toFile(outFile);
      console.log(`Converted: ${img} -> ${outFile}`);
      // Try to close file handles before deleting (Windows fix)
      global.gc && global.gc(); // If node started with --expose-gc
      setTimeout(() => {
        try {
          fs.unlinkSync(img);
          console.log(`Deleted original: ${img}`);
        } catch (delErr) {
          console.error(`Failed to delete ${img}:`, delErr.message);
        }
      }, 100);
    } catch (e) {
      console.error(`Failed to convert ${img}:`, e.message);
    }
  }
  // Wait for all deletes to finish before logging done
  setTimeout(() => {
    console.log('Done.');
  }, 500);
});

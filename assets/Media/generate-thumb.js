// Generates thumbnails for all images in this folder and saves them to ./thumb
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const srcDir = __dirname;
const thumbDir = path.join(srcDir, 'thumb');
const thumbWidth = 200; // px

if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir);
}

fs.readdirSync(srcDir).forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (!exts.includes(ext)) return;
    const srcPath = path.join(srcDir, file);
    const thumbPath = path.join(thumbDir, file);

    // Skip if thumbnail already exists and is newer than source
    if (fs.existsSync(thumbPath)) {
        const srcStat = fs.statSync(srcPath);
        const thumbStat = fs.statSync(thumbPath);
        if (thumbStat.mtimeMs > srcStat.mtimeMs) return;
    }

    sharp(srcPath)
        .resize({ width: thumbWidth })
        .toFile(thumbPath)
        .then(() => console.log(`Thumbnail created: ${thumbPath}`))
        .catch(err => console.error(`Error creating thumbnail for ${file}:`, err));
});

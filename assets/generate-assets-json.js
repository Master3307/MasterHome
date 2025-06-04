const fs = require('fs');
const path = require('path');
const exts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

const mediaDir = path.join(__dirname, 'Media');
const assetsDir = __dirname; // current directory for .js and .css

// --- .gitignore filtering (simple, only exact file/dir names, no wildcards) ---
const gitignorePath = path.join(__dirname, '..', '.gitignore');
let gitignoreSet = new Set();
try {
    if (fs.existsSync(gitignorePath)) {
        const lines = fs.readFileSync(gitignorePath, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
        for (const line of lines) {
            // Only add simple file/dir names (no wildcards, no slashes)
            if (!line.includes('*') && !line.includes('?') && !line.includes('[') && !line.includes(']')) {
                // Add both with and without forward/backward slashes for compatibility
                gitignoreSet.add(line.replace(/^\/+/, '').replace(/\/+$/, ''));
                gitignoreSet.add(line.replace(/^\\+/, '').replace(/\\+$/, ''));
            }
        }
    }
} catch (e) {
    console.warn('Could not read .gitignore:', e);
}
function isIgnoredSimple(relPath) {
    // Checks if the file/dir name or relative path matches any entry in .gitignore (no wildcards)
    const base = path.basename(relPath);
    const rel = relPath.replace(/\\/g, '/');
    return gitignoreSet.has(base) || gitignoreSet.has(rel) || gitignoreSet.has('assets/' + base) || gitignoreSet.has('assets/' + rel);
}
// --- END .gitignore filtering ---

// Helper to get the time when the file was added to the folder (best effort cross-platform)
// On most systems, birthtime is the creation time (when added to folder), but on some (e.g. Linux) it may fallback to ctime.
function getAddedTime(stats) {
    // Prefer birthtime if available and valid
    if (stats.birthtimeMs && stats.birthtimeMs > 0) return stats.birthtime;
    // Fallback: use ctime (last status change, often equals creation on Linux)
    return stats.ctime;
}

// Scan Media for images
function getMediaFiles() {
    try {
        const files = fs.readdirSync(mediaDir);
        return files
            .filter(f => exts.some(ext => f.toLowerCase().endsWith(ext)))
            .filter(f => !isIgnoredSimple(f) && !isIgnoredSimple('Media/' + f) && !isIgnoredSimple('assets/Media/' + f))
            .map(f => {
                const filePath = path.join(mediaDir, f);
                const stats = fs.statSync(filePath);
                return { name: 'Media/' + f, added: getAddedTime(stats) };
            });
    } catch (err) {
        console.error('Error reading Media directory:', err);
        return [];
    }
}

// Scan assets dir for .js and .css (but not in Media)
function getAssetFiles() {
    try {
        const files = fs.readdirSync(assetsDir);
        return files
            .filter(f =>
                (f.endsWith('.js') || f.endsWith('.css')) &&
                f !== path.basename(__filename) && // skip this script
                !fs.statSync(path.join(assetsDir, f)).isDirectory()
            )
            .filter(f => !isIgnoredSimple(f) && !isIgnoredSimple('assets/' + f))
            .map(f => {
                const filePath = path.join(assetsDir, f);
                const stats = fs.statSync(filePath);
                return { name: f, added: getAddedTime(stats) };
            });
    } catch (err) {
        console.error('Error reading assets directory:', err);
        return [];
    }
}

const allImages = getMediaFiles();
const allAssets = getAssetFiles();
allImages.sort((a, b) => a.added - b.added);
allAssets.sort((a, b) => a.added - b.added);
const sortedNames = [...allImages.map(f => f.name), ...allAssets.map(f => f.name)];

fs.writeFile('assets.json', JSON.stringify(sortedNames, null, 2), { flag: 'w' }, (err) => {
    if (err) {
        console.error('Error writing assets.json:', err);
        process.exit(1);
    }
    console.log('assets.json generated:', sortedNames);
});

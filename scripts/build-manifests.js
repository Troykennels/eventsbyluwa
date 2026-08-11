// Builds assets/gallery/gallery.json from the images the owner uploads into
// assets/gallery/<category>/ . Runs in GitHub Actions on every push to the
// gallery folder, so the owner never edits code or JSON, they only drag and
// drop photos into a category folder on github.com.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'assets', 'gallery');
const IMG = /\.(jpe?g|png|webp|gif|avif)$/i;

function title(s) {
  return s.replace(IMG, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

let items = [];
let categories = [];
try { categories = fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory()); }
catch (e) { categories = []; }

for (const cat of categories.sort()) {
  const label = title(cat);
  let files = [];
  try { files = fs.readdirSync(path.join(ROOT, cat)).filter(f => IMG.test(f)); }
  catch (e) { files = []; }
  for (const f of files.sort()) {
    items.push({
      src: 'assets/gallery/' + cat + '/' + f,
      category: label,
      alt: title(f) + ' - Events by Luwa'
    });
  }
}

fs.writeFileSync(path.join(ROOT, 'gallery.json'), JSON.stringify(items, null, 2) + '\n');
console.log('gallery.json written with ' + items.length + ' image(s)');

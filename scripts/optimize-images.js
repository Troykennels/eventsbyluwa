// Auto-optimises photos the owner uploads to assets/gallery/<category>/ .
// Runs in GitHub Actions before the manifest is built, so the owner can drop in
// full-size phone photos and the site stays fast. Resizes to a sensible width
// and re-compresses, only overwriting when the result is actually smaller.
const fs = require('fs');
const path = require('path');

let sharp;
try { sharp = require('sharp'); }
catch (e) { console.log('sharp unavailable, skipping optimisation'); process.exit(0); }

const ROOT = path.join(__dirname, '..', 'assets', 'gallery');
const IMG = /\.(jpe?g|png|webp)$/i;
const MAX_WIDTH = 1600;

async function run() {
  let cats = [];
  try { cats = fs.readdirSync(ROOT).filter(d => fs.statSync(path.join(ROOT, d)).isDirectory()); }
  catch (e) { return; }

  for (const cat of cats) {
    let files = [];
    try { files = fs.readdirSync(path.join(ROOT, cat)).filter(f => IMG.test(f)); }
    catch (e) { continue; }

    for (const f of files) {
      const p = path.join(ROOT, cat, f);
      try {
        const buf = fs.readFileSync(p);
        const meta = await sharp(buf, { failOn: 'none' }).metadata();
        let pipe = sharp(buf, { failOn: 'none' }).rotate(); // respect EXIF orientation
        if (meta.width && meta.width > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH });
        const fmt = (meta.format || '').toLowerCase();
        if (fmt === 'jpeg' || fmt === 'jpg') pipe = pipe.jpeg({ quality: 82, mozjpeg: true });
        else if (fmt === 'png') pipe = pipe.png({ compressionLevel: 9, palette: true });
        else if (fmt === 'webp') pipe = pipe.webp({ quality: 82 });
        else continue;
        const out = await pipe.toBuffer();
        if (out.length < buf.length) {
          fs.writeFileSync(p, out);
          console.log('optimised ' + cat + '/' + f + ' (' + Math.round((1 - out.length / buf.length) * 100) + '% smaller)');
        }
      } catch (e) {
        console.log('skip ' + cat + '/' + f + ': ' + e.message);
      }
    }
  }
}
run();

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

// Dependency-free pixel-dimension reader (JPEG + PNG cover every format the
// upload/optimise pipeline produces). The gallery grid is CSS multi-column
// with each image at its natural aspect ratio (no forced crop) - without
// knowing width/height up front, the browser can't reserve space for a
// lazy-loaded image, so columns render far too narrow until the image
// finishes downloading, and on a slow connection some never visibly recover.
// Recording real dimensions here lets the page set width/height + aspect-
// ratio so the layout is correct from the very first paint.
function readDimensions(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const head = Buffer.alloc(65536);
    const bytesRead = fs.readSync(fd, head, 0, head.length, 0);
    fs.closeSync(fd);
    const buf = head.subarray(0, bytesRead);

    // PNG: signature (8 bytes) then IHDR chunk - width/height are a fixed
    // offset in, no scanning needed.
    if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG: walk the marker segments until an SOFn (start-of-frame) marker,
    // which holds height/width right after a 1-byte precision field.
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) { offset++; continue; }
        const marker = buf[offset + 1];
        // SOF0-SOF3, SOF5-SOF7, SOF9-SOF11, SOF13-SOF15 carry dimensions;
        // skip RST markers (no length field) and 0xFF padding bytes.
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
        if (marker === 0xd9) break; // EOI
        const segLen = buf.readUInt16BE(offset + 2);
        const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSOF) {
          return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
        }
        offset += 2 + segLen;
      }
    }
  } catch (e) { /* fall through to undefined below */ }
  return null;
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
    const dims = readDimensions(path.join(ROOT, cat, f));
    const item = {
      src: 'assets/gallery/' + cat + '/' + f,
      category: label,
      alt: title(f) + ' - Events by Luwa'
    };
    if (dims && dims.width && dims.height) { item.width = dims.width; item.height = dims.height; }
    items.push(item);
  }
}

fs.writeFileSync(path.join(ROOT, 'gallery.json'), JSON.stringify(items, null, 2) + '\n');
console.log('gallery.json written with ' + items.length + ' image(s)');

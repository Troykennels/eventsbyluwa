const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let failures = [];
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
for (const name of pages) {
  const html = fs.readFileSync(path.join(root, name), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  if (/newsletterForm|newsEmail/.test(html)) failures.push(name + ': obsolete subscription form');
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (!value || value.startsWith('#') || /^(?:[a-z]+:|\/\/)/i.test(value)) continue;
    const url = new URL(value, 'https://local.test/' + name);
    const target = path.join(root, decodeURIComponent(url.pathname));
    if (!fs.existsSync(target)) failures.push(name + ': missing ' + value);
    if (url.hash && fs.existsSync(target) && target.endsWith('.html')) {
      const destination = fs.readFileSync(target, 'utf8');
      if (!destination.includes('id="' + url.hash.slice(1) + '"')) failures.push(name + ': missing anchor ' + value);
    }
  }
}
if (fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim() !== 'eventsbyluwa.com') failures.push('Incorrect custom domain');
JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
const photos = JSON.parse(fs.readFileSync(path.join(root, 'assets/gallery/gallery.json')));
for (const photo of photos) if (!fs.existsSync(path.join(root, photo.src))) failures.push('Missing gallery image: ' + photo.src);
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Validated ' + pages.length + ' pages, their local links, and ' + photos.length + ' gallery images.');

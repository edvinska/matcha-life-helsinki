const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
let html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => '<style>\n' + css + '\n</style>')
  .replace('<script src="script.js"></script>', () => '<script>\n' + js + '\n</script>')
  .replace(/src="(assets\/[^"]+)"/g, (_, name) => {
    const type = name.endsWith('.png') ? 'png' : 'jpeg';
    return 'src="data:image/' + type + ';base64,' + fs.readFileSync(name).toString('base64') + '"';
  });
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(html.includes('id="' + match[1] + '"'));
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert(!/<img\b[^>]*\bsrc="(?!data:image)/.test(html));
assert(html.includes(css) && html.includes(js));
const outputDir = 'outputs/atcha-life-homepage';
fs.writeFileSync(path.join(outputDir, 'index.html'), html);
const standalone = html.replace(/href="(index-fi\.html|menu\.html)"/g, (_, file) =>
  'href="atcha-life-homepage/' + file + '"'
).replace('href="index.html" lang="en"', 'href="#top" lang="en"');
fs.writeFileSync('outputs/atcha-life-homepage.html', standalone);
let htmlFi = fs.readFileSync('index-fi.html', 'utf8')
  .replace('<link rel="stylesheet" href="styles.css">', () => '<style>\n' + css + '\n</style>')
  .replace('<script src="script.js"></script>', () => '<script>\n' + js + '\n</script>')
  .replace(/src="(assets\/[^"]+)"/g, (_, name) => {
    const type = name.endsWith('.png') ? 'png' : 'jpeg';
    return 'src="data:image/' + type + ';base64,' + fs.readFileSync(name).toString('base64') + '"';
  });
assert.equal((htmlFi.match(/<h1\b/g) || []).length, 1);
assert(!/<img\b[^>]*\bsrc="(?!data:image)/.test(htmlFi));
for (const match of htmlFi.matchAll(/href="#([^"]+)"/g)) assert(htmlFi.includes('id="' + match[1] + '"'));
fs.writeFileSync(path.join(outputDir, 'index-fi.html'), htmlFi);
for (const file of ['styles.css', 'script.js']) {
  fs.copyFileSync(file, path.join(outputDir, file));
}
fs.mkdirSync(path.join(outputDir, 'assets'), { recursive: true });
for (const file of ['menu.html', 'menu-fi.html']) {
  const menu = fs.readFileSync(file, 'utf8');
  for (const [, asset] of menu.matchAll(/src="(assets\/[^"]+)"/g)) {
    fs.copyFileSync(asset, path.join(outputDir, asset));
  }
  fs.writeFileSync(path.join(outputDir, file), menu);
}
console.log('Exported both homepages and both menu pages with their local assets.');

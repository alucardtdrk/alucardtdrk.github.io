const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('stack.js', 'utf8');
const updateIcon = source.split('const [subtitle, description, topics, label, url] = details[name];')[1].split("dialog.querySelector('#skill-name')")[0];
const html = fs.readFileSync('index.html', 'utf8');
const icons = [...html.matchAll(/<svg class="stack-icon"[^>]*data-src="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/g)];
assert.equal(icons.length, 10);
let current = { replaceWith(next) { current = next; } };
class InlineIcon {
  constructor(paths) { this.paths = paths; this.attributes = {}; }
  cloneNode(deep) { assert.equal(deep, true); return new InlineIcon(this.paths); }
  setAttribute(key, value) { this.attributes[key] = value; }
  replaceWith(next) { current = next; }
}
for (const [, name, paths] of [...icons, ...icons.reverse()]) {
  const original = new InlineIcon(paths);
  const previous = current;
  const card = { querySelector(selector) { assert.equal(selector, '.stack-icon'); return original; } };
  const dialog = { querySelector: () => current };
  // No Image or fetch is supplied: opening must use the embedded SVG directly.
  vm.runInNewContext(`{${updateIcon}}`, { card, dialog });
  assert.notEqual(current, previous, name);
  assert.notEqual(current, original, 'carousel icon must stay in place');
  assert.equal(current.paths, paths, name);
  assert.equal(current.attributes.class, 'skill-icon');
  assert.equal(current.attributes.width, '58');
  assert.equal(current.attributes.height, '58');
}
console.log('PASS: all 10 icons and repeated switches use embedded SVGs without image loading.');

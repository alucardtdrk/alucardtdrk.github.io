const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('stack.js', 'utf8');
const updateIcon = source.split('const [subtitle, description, topics, label, url] = details[name];')[1].split("dialog.querySelector('#skill-name')")[0];
let current;
class TestImage {
  constructor(width, height) { this.width = width; this.height = height; }
  replaceWith(next) { current = next; }
}
const dialog = { querySelector: () => current };
let selected;
const card = { querySelector: () => ({ dataset: { src: selected } }) };
const context = vm.createContext({ Image: TestImage, card, dialog });
for (const name of ['react', 'n8n', 'react', 'git', 'n8n']) {
  selected = `icons/${name}.svg`;
  const previous = current = current || new TestImage(58, 58);
  vm.runInContext(`{${updateIcon}}`, context);
  assert.notEqual(current, previous, 'each opening must replace the previous image');
  assert.equal(current.src, selected, 'icon must match the selected card');
  assert.equal(current.className, 'skill-icon');
  assert.equal(current.alt, '');
  assert.equal(current.width, 58);
  assert.equal(current.height, 58);
}
console.log('PASS: repeated React/n8n switches use fresh images with the selected source.');

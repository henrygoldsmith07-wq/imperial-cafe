'use strict';
// Zero-dependency verification for imperial-cafe. Run: node verify.js
// Checks static invariants and exercises app.js against a minimal DOM stub.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const html = read('index.html');
const css = read('style.css');
const notFound = read('404.html');

// --- Static invariants -------------------------------------------------------
for (const f of ['index.html', 'style.css', 'app.js', '404.html', 'favicon.svg', 'og-image.png', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'README.md']) {
  assert.ok(fs.existsSync(path.join(__dirname, f)), `${f} exists`);
}
assert.ok(!/\uFFFD/.test(html), 'HTML has no replacement characters');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'exactly one h1');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'no duplicate IDs');
for (const m of html.matchAll(/href="#([^"]*)"/g)) {
  if (m[1]) assert.ok(ids.includes(m[1]), `anchor #${m[1]} resolves`);
}

for (const [label, doc] of [['index', html], ['404', notFound]]) {
  assert.match(doc, /http-equiv="Content-Security-Policy"/, `${label} CSP present`);
  assert.match(doc, /default-src 'none'/, `${label} CSP default none`);
  for (const d of ['script-src', 'style-src', 'img-src', 'connect-src', 'frame-src', 'font-src', 'worker-src', 'media-src', 'base-uri', 'form-action', 'object-src']) {
    assert.match(doc, new RegExp(`${d} `), `${label} CSP has ${d}`);
  }
}
assert.ok(!/img-src[^;]*data:/.test(html), 'CSP drops unused data image source');
assert.match(html, /name="referrer" content="strict-origin-when-cross-origin"/, 'referrer policy present');
assert.ok(!/<script[^>]+src="https?:/.test(html), 'no remote scripts');
assert.match(html, /<script src="app\.js" defer>/, 'local app script included');
for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  assert.match(m[0], /rel="[^"]*noopener[^"]*noreferrer"/, 'blank link has noopener noreferrer');
}
assert.equal((html.match(/target="_blank"/g) || []).length,
  [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].length, 'all blank targets are links');

assert.match(html, /<link rel="canonical"/, 'canonical present');
assert.match(html, /rel="manifest" href="site.webmanifest"/, 'manifest linked');
const manifest = JSON.parse(read('site.webmanifest'));
assert.equal(manifest.name, 'Imperial Cafe', 'manifest branded name');
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(ld, 'JSON-LD present');
const data = JSON.parse(ld[1]);
assert.equal(data['@type'], 'CafeOrCoffeeShop', 'schema type');
assert.equal(data.telephone, '+442920463900', 'schema telephone');
assert.equal(data.name, 'Imperial Cafe', 'schema name');

assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'CSS braces balanced');
assert.ok(!/studio/.test(css), 'no unused studio theme');
assert.ok(css.includes('.diner{'), 'active diner theme present');
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/, 'reduced motion rule');
assert.match(css, /@media print/, 'print rule');
assert.match(html, /class="planning-call" href="tel:/, 'dark-panel call link marked');
assert.match(css, /\.planning-call:focus-visible\{outline-color:var\(--paper\)\}/, 'light focus ring scoped to dark-panel link');
assert.ok(!/\.planning :focus-visible/.test(css), 'light ring not applied to whole planning subtree');
assert.match(css, /scroll-padding-bottom:100px/, 'mobile bottom scroll padding');
assert.match(css, /min-height:24px/, 'nav link target size');
assert.match(css, /header nav a:not\(:last-child\)\{display:none\}/, 'mobile hide scoped to header nav');
assert.ok(!/(?<!header )nav a:not\(:last-child\)\{display:none\}/.test(css), 'no global nav-hide rule');
assert.ok(!/localStorage|mailto:/i.test(html), 'no stale storage or email claims');
assert.match(read('robots.txt'), /Disallow: \//, 'pre-launch indexing block present');
assert.match(read('README.md'), /Browser verification/, 'README records browser verification');

// --- DOM stub and behaviour --------------------------------------------------
function el(extra = {}) {
  return Object.assign({
    value: '', min: '', max: '', hidden: false, textContent: '', href: '', className: '', type: '',
    dataset: {}, children: [], _cv: '', _handlers: {},
    setCustomValidity(msg) { this._cv = msg || ''; },
    reportValidity() { return !this._cv; },
    addEventListener(t, fn) { this._handlers[t] = fn; },
    append(...args) { this.children.push(...args); },
    replaceChildren(...args) { this.children = args; },
    focus() {},
  }, extra);
}
const nodes = {
  '#visit-form': el({ reportValidity() {
    const n = nodes['#name'], d = nodes['#date'];
    return !n._cv && !!n.value.trim() && !!d.value && d.value >= d.min && d.value <= d.max;
  } }),
  '#date': el(), '#name': el(), '#website': el(),
  '#service': el({ value: 'Breakfast enquiry' }), '#notes': el({ value: '' }), '#result': el(),
};
const serviceLinks = [el({ dataset: { service: 'Breakfast enquiry' } }), el({ dataset: { service: 'Lunch enquiry' } })];
global.document = {
  querySelector: sel => nodes[sel],
  querySelectorAll: sel => sel === '[data-service]' ? serviceLinks : [],
  createElement: () => el(),
};
Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: async () => {} } }, configurable: true });
require('./app.js');

const form = nodes['#visit-form'], date = nodes['#date'], name = nodes['#name'], result = nodes['#result'];
const london = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });
const iso = d => { const p = Object.fromEntries(london.formatToParts(d).map(x => [x.type, x.value])); return `${p.year}-${p.month}-${p.day}`; };
const today = iso(new Date());
const [y, m, d] = today.split('-').map(Number);
assert.equal(date.min, today, 'date min is London today');
assert.equal(date.max, new Date(Date.UTC(y, m - 1, d + 365)).toISOString().slice(0, 10), 'date max is +365 days');

serviceLinks[1]._handlers.click();
assert.equal(nodes['#service'].value, 'Lunch enquiry', 'service link sets enquiry');

name.value = 'Ada'; nodes['#notes'].value = 'Two teas, no sugar'; date.value = today; nodes['#website'].value = '';
form._handlers.submit({ preventDefault() {} });
assert.equal(result.hidden, false, 'result shown');
const note = result.children.find(c => c.textContent && c.textContent.includes('visit note')).textContent;
assert.match(note, /Name: Ada/);
assert.match(note, /Preferred day: \w+, \d+ \w+ \d{4}/);
assert.match(note, /Enquiry: Lunch enquiry/);
assert.match(note, /Two teas, no sugar/);
const flat = [];
(function walk(n) { for (const c of n.children || []) { flat.push(c); walk(c); } })(result);
assert.ok(flat.some(c => c.textContent === 'Call to confirm. This has not been sent.'), 'confirmation text');
assert.ok(flat.some(c => c.href === 'tel:+442920463900'), 'call link');
assert.ok(flat.some(c => c.textContent === 'Copy note'), 'copy button');

result.hidden = true; result.children = []; name.value = '   ';
form._handlers.submit({ preventDefault() {} });
assert.match(name._cv, /Please enter your name/, 'blank name rejected');
assert.equal(result.hidden, true, 'no output for blank name');

name.value = 'Ada'; name._cv = ''; date.value = '2000-01-01';
form._handlers.submit({ preventDefault() {} });
assert.equal(result.hidden, true, 'out-of-range date rejected by native constraints');

result.hidden = true; result.children = []; date.value = today; nodes['#website'].value = 'bot';
form._handlers.submit({ preventDefault() {} });
assert.equal(result.hidden, true, 'honeypot blocks output');

(async () => {
  // Copy note: success path passes the exact note and confirms.
  let captured = null;
  globalThis.navigator.clipboard.writeText = async t => { captured = t; };
  nodes['#website'].value = '';
  form._handlers.submit({ preventDefault() {} });
  const collect = root => { const a = []; (function walk(n) { for (const c of n.children || []) { a.push(c); walk(c); } })(root); return a; };
  const okButton = collect(result).find(c => c.textContent === 'Copy note');
  assert.ok(okButton, 'copy button regenerated');
  await okButton._handlers.click();
  assert.equal(captured, result.children.find(c => c.textContent && c.textContent.includes('visit note')).textContent, 'clipboard gets exact note');
  assert.equal(okButton.textContent, 'Note copied', 'success label');

  // Copy note: denied clipboard falls back to a readable instruction.
  globalThis.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
  form._handlers.submit({ preventDefault() {} });
  const deniedButton = collect(result).find(c => c.textContent === 'Copy note');
  assert.ok(deniedButton, 'copy button present after denial setup');
  await deniedButton._handlers.click();
  assert.equal(deniedButton.textContent, 'Select the note above to copy', 'denied label');

  console.log(`PASS imperial-cafe: ${ids.length} IDs, ${(css.match(/\{/g) || []).length} CSS rules, all behaviour checks including copy`);
})().catch(err => { console.error(err); process.exitCode = 1; });

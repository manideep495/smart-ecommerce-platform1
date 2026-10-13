import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredPages = ['index.html','products.html','product.html','budget.html','compare.html','recommendations.html','cart.html','wishlist.html','about.html','contact.html','privacy.html','terms.html'];
const files = readdirSync(root).filter((name) => name.endsWith('.html'));
assert.deepEqual([...files].sort(), [...requiredPages].sort(), 'all requested pages exist without unexpected page files');
const app = readFileSync(resolve(root, 'js/app.js'), 'utf8');
const catalog = readFileSync(resolve(root, 'js/products.js'), 'utf8');
const css = readFileSync(resolve(root, 'css/style.css'), 'utf8');
const links = new Set();

for (const file of requiredPages) {
  const html = readFileSync(resolve(root, file), 'utf8');
  assert.match(html, /<!doctype html>/i, `${file} has an HTML5 doctype`);
  assert.match(html, /<html lang="en">/i, `${file} declares its language`);
  assert.match(html, /<main id="main">/, `${file} has a main landmark`);
  assert.match(html, /<nav[^>]+aria-label="Main navigation"/, `${file} has labelled primary navigation`);
  for (const [, href] of html.matchAll(/href="([^"#][^"]*)"/g)) {
    const local = href.split(/[?#]/, 1)[0];
    if (local && !local.includes(':')) {
      assert.ok(existsSync(resolve(root, local)), `${file} link target exists: ${href}`);
      links.add(local);
    }
  }
  for (const [, src] of html.matchAll(/src="([^"#][^"]*)"/g)) {
    if (!/^https?:/.test(src)) assert.ok(existsSync(resolve(root, src.split(/[?#]/,1)[0])), `${file} script or asset exists: ${src}`);
  }
}

for (const file of requiredPages.filter((name) => name !== 'product.html')) assert.ok(links.has(file), `site links to ${file}`);
assert.match(app, /product\.html\?id=/, 'catalog and related-product links open direct product details');
assert.equal((catalog.match(/\{id:'/g) || []).length, 12, 'all original sample products remain');
assert.equal((catalog.match(/image:'https:\/\/images\.unsplash\.com/g) || []).length, 12, 'every sample product has a photographic image source');
for (const id of ['catalogSearch','categoryFilters','sortSelect','budgetForm','budgetInput','compareOne','compareTwo','compareThree','cartItems','checkoutForm','confirmDemoOrder','contactPreviewButton','wishlistProducts','recommendationsList']) {
  assert.ok(app.includes(id), `application handles ${id}`);
}
assert.match(app, /localStorage/);
assert.doesNotMatch(app, /scrollIntoView|location\.hash/);
assert.match(css, /@media\(max-width:600px\)/);
assert.match(css, /:focus-visible/);
assert.match(readFileSync(resolve(root, 'recommendations.html'), 'utf8'), /HOW THE RULES WORK/);
console.log(`SmartCart project validation passed across ${requiredPages.length} pages and local navigation targets.`);

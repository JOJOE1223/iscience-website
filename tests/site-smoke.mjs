import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const files = {
  home: join(root, 'index.html'),
  about: join(root, 'about', 'index.html'),
  contact: join(root, 'contact', 'index.html'),
  styles: join(root, 'styles.css'),
  script: join(root, 'script.js'),
  logo: join(root, 'assets', 'iscience-logo.png'),
};

for (const [name, file] of Object.entries(files)) {
  assert.equal(existsSync(file), true, `${name} file is missing: ${file}`);
}

const pageNames = ['home', 'about', 'contact'];
const pageByName = Object.fromEntries(
  pageNames.map((name) => [name, readFileSync(files[name], 'utf8')]),
);
const pages = Object.values(pageByName);
const combined = pages.join('\n');

assert.equal((combined.match(/\bIScience\b/g) ?? []).length >= 4, true, 'Each page must use exact IScience branding');
assert.equal(combined.includes('href="#"'), false, 'Placeholder navigation links are not allowed');
assert.equal(pageByName.contact.includes('href="mailto:admin@iscience.co.za"'), true, 'Contact page must link to the active business mailbox');
assert.equal(pageByName.contact.includes('info@iscience.co.za'), false, 'Contact page must not show the superseded mailbox');
assert.equal(pageByName.contact.includes('pending mailbox activation'), false, 'Contact page must not show the active mailbox as pending');
assert.equal(/revolutionary|world-leading|game-changing|guaranteed results|industry-leading/i.test(combined), false, 'Unsupported marketing claims found');
assert.equal(/<img[^>]+src="(?:\.\.\/)?assets\/iscience-logo\.png"[^>]+alt="[^"]+"/i.test(combined), true, 'Pages must use the supplied logo with meaningful alt text');

assert.equal(/calculator/i.test(combined), false, 'Retired Calculator must not remain in the public pages');

const expectedTargets = ['index.html', 'about/index.html', 'contact/index.html'];
for (const target of expectedTargets) {
  assert.equal(combined.includes(`href="${target}"`), true, `Expected navigation target is missing: ${target}`);
}

console.log('site smoke checks passed');

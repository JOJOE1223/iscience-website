import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const files = {
  home: join(root, 'index.html'),
  about: join(root, 'about', 'index.html'),
  contact: join(root, 'contact', 'index.html'),
  calculator: join(root, 'calculator', 'index.html'),
  calculatorController: join(root, 'calculator', 'calculator.js'),
  calculatorEngine: join(root, 'calculator', 'calculator-engine.js'),
  calculatorState: join(root, 'calculator', 'calculator-state.js'),
  styles: join(root, 'styles.css'),
  script: join(root, 'script.js'),
  logo: join(root, 'assets', 'iscience-logo.png'),
};

for (const [name, file] of Object.entries(files)) {
  assert.equal(existsSync(file), true, `${name} file is missing: ${file}`);
}

const pageNames = ['home', 'about', 'contact', 'calculator'];
const pageByName = Object.fromEntries(
  pageNames.map((name) => [name, readFileSync(files[name], 'utf8')]),
);
const pages = Object.values(pageByName);
const combined = pages.join('\n');
const calculatorHtml = pageByName.calculator;

assert.equal((combined.match(/\bIScience\b/g) ?? []).length >= 4, true, 'Each page must use exact IScience branding');
assert.equal(combined.includes('href="#"'), false, 'Placeholder navigation links are not allowed');
assert.equal(combined.includes('mailto:info@iscience.co.za'), false, 'Email must remain pending until activation is confirmed');
assert.equal(/revolutionary|world-leading|game-changing|guaranteed results|industry-leading/i.test(combined), false, 'Unsupported marketing claims found');
assert.equal(/<img[^>]+src="(?:\.\.\/)?assets\/iscience-logo\.png"[^>]+alt="[^"]+"/i.test(combined), true, 'Pages must use the supplied logo with meaningful alt text');

assert.match(calculatorHtml, /Feed Cost Calculator/);
assert.match(
  calculatorHtml,
  /This calculator estimates feed production costs from user-supplied ingredient prices and inclusion rates\./,
);
assert.match(
  calculatorHtml,
  /does not formulate diets or assess nutritional adequacy/,
);
assert.match(
  calculatorHtml,
  /<script type="module" src="calculator\.js"><\/script>/,
);
assert.equal(
  /we recommend|recommended inclusion|optimal inclusion|nutritionally complete/i.test(calculatorHtml),
  false,
  'Calculator must not provide nutrition recommendations',
);

assert.match(pageByName.home, /href="calculator\/index\.html"/);
assert.match(pageByName.about, /href="\.\.\/calculator\/index\.html"/);
assert.match(pageByName.contact, /href="\.\.\/calculator\/index\.html"/);
assert.match(pageByName.calculator, /href="index\.html"[^>]+aria-current="page"/);

const expectedTargets = ['index.html', 'about/index.html', 'contact/index.html'];
for (const target of expectedTargets) {
  assert.equal(combined.includes(`href="${target}"`), true, `Expected navigation target is missing: ${target}`);
}

console.log('site smoke checks passed');

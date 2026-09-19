import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateFeedCost,
  formatPercent,
  formatRand,
} from '../calculator/calculator-engine.js';

const closeTo = (actual, expected, tolerance = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} was not within ${tolerance} of ${expected}`,
  );
};

const operatingMix = [
  { name: 'Maize', inclusion: 50, price: 4200 },
  { name: 'Soybean meal', inclusion: 25, price: 8500 },
  { name: 'Wheat bran', inclusion: 20, price: 3500 },
  { name: 'Mineral/vitamin premix', inclusion: 5, price: 15000 },
];

const calculate = (overrides = {}) => calculateFeedCost({
  ingredients: [{ name: 'Maize', inclusion: 100, price: 4000 }],
  manufacturingCost: 0,
  transportCost: 0,
  otherCost: 0,
  grossMargin: 0,
  ...overrides,
});

test('calculates the required two-ingredient zero-margin mix', () => {
  const result = calculate({
    ingredients: [
      { name: 'Maize', inclusion: 60, price: 4000 },
      { name: 'Soybean meal', inclusion: 40, price: 8000 },
    ],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.contributions, [2400, 3200]);
  assert.equal(result.totalInclusion, 100);
  assert.equal(result.ingredientCost, 5600);
  assert.equal(result.productionCost, 5600);
  assert.equal(result.sellingPrice, 5600);
  assert.equal(result.grossProfit, 0);
  assert.equal(result.inclusionWarning, '');
});

test('calculates multiple ingredients and operating costs', () => {
  const result = calculate({
    ingredients: operatingMix,
    manufacturingCost: 350,
    transportCost: 250,
    otherCost: 100,
  });

  assert.deepEqual(result.contributions, [2100, 2125, 700, 750]);
  assert.equal(result.totalInclusion, 100);
  assert.equal(result.ingredientCost, 5675);
  assert.equal(result.additionalCosts, 700);
  assert.equal(result.productionCost, 6375);
  assert.equal(result.sellingPrice, 6375);
  assert.equal(result.grossProfit, 0);
});

test('uses gross margin rather than markup for selling price', () => {
  const result = calculate({
    ingredients: operatingMix,
    manufacturingCost: 350,
    transportCost: 250,
    otherCost: 100,
    grossMargin: 20,
  });

  assert.equal(result.productionCost, 6375);
  assert.equal(result.sellingPrice, 7968.75);
  assert.equal(result.grossProfit, 1593.75);
  assert.notEqual(result.sellingPrice, 7650);
  assert.equal(result.equivalentMarkup, 25);
});

test('keeps a 95 percent mixture unnormalised and reports the shortfall', () => {
  const result = calculate({
    ingredients: [
      { name: 'Maize', inclusion: 50, price: 4000 },
      { name: 'Soybean meal', inclusion: 30, price: 8000 },
      { name: 'Wheat bran', inclusion: 15, price: 3000 },
    ],
  });

  assert.deepEqual(result.contributions, [2000, 2400, 450]);
  assert.equal(result.totalInclusion, 95);
  assert.equal(result.ingredientCost, 4850);
  assert.equal(
    result.inclusionWarning,
    'Mixture is 5.00 percentage points short of 100%.',
  );
});

test('retains precision for decimal inclusion rates and rounds only for display', () => {
  const result = calculate({
    ingredients: [
      { name: 'Ingredient A', inclusion: 62.5, price: 3840 },
      { name: 'Ingredient B', inclusion: 27.5, price: 7200 },
      { name: 'Ingredient C', inclusion: 7.5, price: 4600 },
      { name: 'Ingredient D', inclusion: 2.5, price: 12000 },
    ],
    manufacturingCost: 275,
    transportCost: 180,
    otherCost: 45,
    grossMargin: 25,
  });

  result.contributions.forEach((value, index) => {
    closeTo(value, [2400, 1980, 345, 300][index]);
  });
  assert.equal(result.totalInclusion, 100);
  assert.equal(result.ingredientCost, 5025);
  assert.equal(result.additionalCosts, 500);
  assert.equal(result.productionCost, 5525);
  closeTo(result.sellingPrice, 7366.666666666667);
  closeTo(result.grossProfit, 1841.666666666667);
});

test('rejects a negative ingredient price', () => {
  const result = calculate({
    ingredients: [{ name: 'Maize', inclusion: 100, price: -1 }],
  });

  assert.equal(result.ok, false);
  assert.equal(
    result.errors['ingredients.0.price'],
    'Price must be a non-negative number.',
  );
});

test('rejects a negative inclusion percentage', () => {
  const result = calculate({
    ingredients: [{ name: 'Maize', inclusion: -1, price: 4000 }],
  });

  assert.equal(result.ok, false);
  assert.equal(
    result.errors['ingredients.0.inclusion'],
    'Inclusion must be a non-negative number.',
  );
});

test('rejects an empty ingredient name', () => {
  const result = calculate({
    ingredients: [{ name: '   ', inclusion: 100, price: 4000 }],
  });

  assert.equal(result.ok, false);
  assert.equal(
    result.errors['ingredients.0.name'],
    'Ingredient name is required.',
  );
});

test('reports inclusion above 100 without clamping it', () => {
  const result = calculate({
    ingredients: [{ name: 'Maize', inclusion: 103, price: 4000 }],
  });

  assert.equal(result.ok, true);
  assert.equal(result.totalInclusion, 103);
  assert.equal(result.ingredientCost, 4120);
  assert.equal(
    result.inclusionWarning,
    'Mixture exceeds 100% by 3.00 percentage points.',
  );
});

test('accepts a 99 percent gross margin', () => {
  const result = calculate({ grossMargin: 99 });

  assert.equal(result.ok, true);
  closeTo(result.sellingPrice, 400000);
  closeTo(result.grossProfit, 396000);
});

test('rejects a gross margin of 100 percent', () => {
  const result = calculate({ grossMargin: 100 });

  assert.equal(result.ok, false);
  assert.equal(
    result.errors.grossMargin,
    'Gross margin must be at least 0% and less than 100%.',
  );
  assert.equal(result.sellingPrice, null);
  assert.equal(result.grossProfit, null);
});

test('accepts a zero ingredient price', () => {
  const result = calculate({
    ingredients: [{ name: 'No-cost ingredient', inclusion: 100, price: 0 }],
  });

  assert.equal(result.ok, true);
  assert.equal(result.ingredientCost, 0);
  assert.equal(result.productionCost, 0);
});

test('accepts zero manufacturing and transport costs', () => {
  const result = calculate({ manufacturingCost: 0, transportCost: 0 });

  assert.equal(result.ok, true);
  assert.equal(result.additionalCosts, 0);
});

test('calculates decimal monetary values without early rounding', () => {
  const result = calculate({
    ingredients: [{ name: 'Ingredient', inclusion: 50, price: 1000.55 }],
    manufacturingCost: 10.25,
    transportCost: 20.15,
    otherCost: 5.05,
    grossMargin: 10,
  });

  closeTo(result.ingredientCost, 500.275);
  closeTo(result.additionalCosts, 35.45);
  closeTo(result.productionCost, 535.725);
  closeTo(result.sellingPrice, 595.25);
});

test('treats empty numeric fields as zero', () => {
  const result = calculate({
    ingredients: [{ name: 'Ingredient', inclusion: '', price: '' }],
    manufacturingCost: '',
    transportCost: '',
    otherCost: '',
    grossMargin: '',
  });

  assert.equal(result.ok, true);
  assert.equal(result.totalInclusion, 0);
  assert.equal(result.productionCost, 0);
});

test('rejects malformed numeric fields', () => {
  const result = calculate({
    ingredients: [{ name: 'Ingredient', inclusion: 'ten', price: 'many' }],
    manufacturingCost: 'several',
  });

  assert.equal(result.ok, false);
  assert.equal(
    result.errors['ingredients.0.inclusion'],
    'Inclusion must be a non-negative number.',
  );
  assert.equal(
    result.errors['ingredients.0.price'],
    'Price must be a non-negative number.',
  );
  assert.equal(
    result.errors.manufacturingCost,
    'Manufacturing cost must be a non-negative number.',
  );
});

test('rejects negative optional costs and gross margin', () => {
  const result = calculate({
    manufacturingCost: -1,
    transportCost: -2,
    otherCost: -3,
    grossMargin: -4,
  });

  assert.equal(result.ok, false);
  assert.equal(
    result.errors.manufacturingCost,
    'Manufacturing cost must be a non-negative number.',
  );
  assert.equal(
    result.errors.transportCost,
    'Transport cost must be a non-negative number.',
  );
  assert.equal(
    result.errors.otherCost,
    'Other cost must be a non-negative number.',
  );
  assert.equal(
    result.errors.grossMargin,
    'Gross margin must be at least 0% and less than 100%.',
  );
});

test('treats floating-point totals within tolerance as 100 percent', () => {
  const result = calculate({
    ingredients: [
      { name: 'A', inclusion: 33.3333333333, price: 1 },
      { name: 'B', inclusion: 33.3333333333, price: 1 },
      { name: 'C', inclusion: 33.3333333334, price: 1 },
    ],
  });

  closeTo(result.totalInclusion, 100);
  assert.equal(result.inclusionWarning, '');
});

test('formats rand and percentages to the brief\'s two-decimal convention', () => {
  assert.equal(formatRand(5842.5), 'R 5,842.50');
  assert.equal(formatRand(0), 'R 0.00');
  assert.equal(formatPercent(25), '25.00%');
});

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addIngredient,
  createExampleState,
  createResetState,
  removeIngredient,
} from '../calculator/calculator-state.js';

test('adds one blank ingredient with a unique numeric id', () => {
  const initial = createResetState();
  const next = addIngredient(initial);

  assert.equal(next.ingredients.length, 2);
  assert.deepEqual(next.ingredients[1], {
    id: 2,
    name: '',
    inclusion: '',
    price: '',
  });
  assert.equal(next.nextId, 3);
  assert.notEqual(next, initial);
  assert.equal(initial.ingredients.length, 1);
});

test('deletes only the selected ingredient without mutating the input', () => {
  const initial = createExampleState();
  const removedId = initial.ingredients[1].id;
  const next = removeIngredient(initial, removedId);

  assert.deepEqual(
    next.ingredients.map(({ name }) => name),
    ['Maize', 'Wheat bran', 'Mineral/vitamin premix'],
  );
  assert.equal(initial.ingredients.length, 4);
  assert.equal(next.nextId, initial.nextId);
});

test('keeps one editable row when deleting the final ingredient', () => {
  const initial = createResetState();
  const next = removeIngredient(initial, initial.ingredients[0].id);

  assert.deepEqual(next.ingredients, [{
    id: 2,
    name: '',
    inclusion: '',
    price: '',
  }]);
  assert.equal(next.nextId, 3);
});

test('ignores a delete request for an unknown ingredient id', () => {
  const initial = createExampleState();
  const next = removeIngredient(initial, 999);

  assert.deepEqual(next, initial);
  assert.notEqual(next, initial);
});

test('reset returns one blank ingredient and zero optional costs', () => {
  assert.deepEqual(createResetState(), {
    ingredients: [{ id: 1, name: '', inclusion: '', price: '' }],
    manufacturingCost: 0,
    transportCost: 0,
    otherCost: 0,
    grossMargin: 0,
    nextId: 2,
  });
});

test('example returns the approved illustrative costing data', () => {
  assert.deepEqual(createExampleState(), {
    ingredients: [
      { id: 1, name: 'Maize', inclusion: 50, price: 4200 },
      { id: 2, name: 'Soybean meal', inclusion: 25, price: 8500 },
      { id: 3, name: 'Wheat bran', inclusion: 20, price: 3500 },
      {
        id: 4,
        name: 'Mineral/vitamin premix',
        inclusion: 5,
        price: 15000,
      },
    ],
    manufacturingCost: 350,
    transportCost: 250,
    otherCost: 100,
    grossMargin: 20,
    nextId: 5,
  });
});

test('example calls return independent ingredient objects', () => {
  const first = createExampleState();
  const second = createExampleState();

  first.ingredients[0].name = 'Changed';
  assert.equal(second.ingredients[0].name, 'Maize');
});

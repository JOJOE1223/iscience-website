import {
  calculateFeedCost,
  formatPercent,
  formatRand,
} from './calculator-engine.js';
import {
  addIngredient,
  createExampleState,
  createResetState,
  removeIngredient,
} from './calculator-state.js';

const form = document.querySelector('#feed-calculator');
const ingredientRows = document.querySelector('#ingredient-rows');
const validationSummary = document.querySelector('#validation-summary');
const validationList = document.querySelector('#validation-list');
const inclusionWarning = document.querySelector('#inclusion-warning');

const costInputs = {
  manufacturingCost: document.querySelector('#manufacturing-cost'),
  transportCost: document.querySelector('#transport-cost'),
  otherCost: document.querySelector('#other-cost'),
  grossMargin: document.querySelector('#gross-margin'),
};

const outputs = {
  totalInclusion: document.querySelector('#total-inclusion'),
  ingredientCost: document.querySelector('#ingredient-cost'),
  manufacturingCost: document.querySelector('#manufacturing-output'),
  transportCost: document.querySelector('#transport-output'),
  otherCost: document.querySelector('#other-output'),
  additionalCosts: document.querySelector('#additional-costs'),
  productionCost: document.querySelector('#production-cost'),
  grossMargin: document.querySelector('#gross-margin-output'),
  sellingPrice: document.querySelector('#selling-price'),
  grossProfit: document.querySelector('#gross-profit'),
  equivalentMarkup: document.querySelector('#equivalent-markup'),
};

let state = createExampleState();
let showValidation = false;

function createInput({ id, field, label, type = 'text', value }) {
  const input = document.createElement('input');
  input.id = id;
  input.name = field;
  input.dataset.field = field;
  input.type = type;
  input.value = value;
  input.setAttribute('aria-label', label);

  if (type === 'number') {
    input.min = '0';
    input.step = 'any';
    input.inputMode = 'decimal';
  }

  return input;
}

function createFieldCell({ ingredient, index, field, label, type, value }) {
  const cell = document.createElement('td');
  cell.dataset.label = label;

  const inputId = `ingredient-${ingredient.id}-${field}`;
  const errorId = `${inputId}-error`;
  const input = createInput({
    id: inputId,
    field,
    label: `Ingredient ${index + 1} ${label.toLowerCase()}`,
    type,
    value,
  });
  input.setAttribute('aria-describedby', errorId);

  const error = document.createElement('span');
  error.className = 'field-error';
  error.id = errorId;

  cell.append(input, error);
  return cell;
}

function renderRows() {
  ingredientRows.replaceChildren();

  state.ingredients.forEach((ingredient, index) => {
    const row = document.createElement('tr');
    row.dataset.ingredientId = String(ingredient.id);

    row.append(
      createFieldCell({
        ingredient,
        index,
        field: 'name',
        label: 'Ingredient',
        value: ingredient.name,
      }),
      createFieldCell({
        ingredient,
        index,
        field: 'inclusion',
        label: 'Inclusion %',
        type: 'number',
        value: ingredient.inclusion,
      }),
      createFieldCell({
        ingredient,
        index,
        field: 'price',
        label: 'Price R/t',
        type: 'number',
        value: ingredient.price,
      }),
    );

    const contribution = document.createElement('td');
    contribution.dataset.label = 'Cost contribution R/t';
    contribution.dataset.contributionId = String(ingredient.id);
    contribution.className = 'contribution-value';
    contribution.textContent = '—';

    const actionCell = document.createElement('td');
    actionCell.dataset.label = 'Action';
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-ingredient';
    removeButton.type = 'button';
    removeButton.dataset.removeIngredient = String(ingredient.id);
    removeButton.textContent = 'Remove';
    removeButton.setAttribute(
      'aria-label',
      `Remove ${ingredient.name || `ingredient ${index + 1}`}`,
    );
    actionCell.append(removeButton);

    row.append(contribution, actionCell);
    ingredientRows.append(row);
  });
}

function syncCostInputs() {
  Object.entries(costInputs).forEach(([key, input]) => {
    input.value = state[key];
  });
}

function clearValidation() {
  form.querySelectorAll('[aria-invalid="true"]').forEach((input) => {
    input.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.field-error').forEach((error) => {
    error.textContent = '';
  });
  validationList.replaceChildren();
  validationSummary.hidden = true;
}

function fieldForError(key) {
  if (key.startsWith('ingredients.')) {
    const [, indexText, field] = key.split('.');
    const ingredient = state.ingredients[Number(indexText)];
    return ingredient
      ? document.querySelector(`#ingredient-${ingredient.id}-${field}`)
      : null;
  }

  return costInputs[key] ?? null;
}

function showErrors(errors) {
  clearValidation();
  if (!showValidation || Object.keys(errors).length === 0) return;

  Object.entries(errors).forEach(([key, message]) => {
    const input = fieldForError(key);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      const error = document.querySelector(`#${input.id}-error`);
      if (error) error.textContent = message;
    }

    const item = document.createElement('li');
    item.textContent = message;
    validationList.append(item);
  });

  validationSummary.hidden = false;
}

function numericValue(value) {
  if (value === '' || value === null || value === undefined) return 0;
  return Number(value);
}

function perTonne(value) {
  return `${formatRand(value)} / t`;
}

function setFinancialOutputs(result) {
  const validValue = (value) => (result.ok ? perTonne(value) : '—');
  outputs.ingredientCost.textContent = validValue(result.ingredientCost);
  outputs.manufacturingCost.textContent = result.ok
    ? perTonne(numericValue(state.manufacturingCost))
    : '—';
  outputs.transportCost.textContent = result.ok
    ? perTonne(numericValue(state.transportCost))
    : '—';
  outputs.otherCost.textContent = result.ok
    ? perTonne(numericValue(state.otherCost))
    : '—';
  outputs.additionalCosts.textContent = validValue(result.additionalCosts);
  outputs.productionCost.textContent = validValue(result.productionCost);
  outputs.grossMargin.textContent = result.ok
    ? formatPercent(numericValue(state.grossMargin))
    : '—';
  outputs.sellingPrice.textContent = result.ok
    ? perTonne(result.sellingPrice)
    : '—';
  outputs.grossProfit.textContent = result.ok
    ? perTonne(result.grossProfit)
    : '—';
  outputs.equivalentMarkup.textContent = result.ok
    ? formatPercent(result.equivalentMarkup)
    : '—';
}

function renderResults() {
  const result = calculateFeedCost(state);
  outputs.totalInclusion.textContent = formatPercent(result.totalInclusion);

  inclusionWarning.classList.toggle('is-warning', Boolean(result.inclusionWarning));
  inclusionWarning.classList.toggle('is-complete', !result.inclusionWarning);
  inclusionWarning.textContent = result.inclusionWarning
    || 'Mixture totals 100.00%.';

  state.ingredients.forEach((ingredient, index) => {
    const contribution = document.querySelector(
      `[data-contribution-id="${ingredient.id}"]`,
    );
    if (contribution) {
      contribution.textContent = result.ok
        ? perTonne(result.contributions[index])
        : '—';
    }
  });

  setFinancialOutputs(result);
  showErrors(result.errors);
}

function renderAll() {
  renderRows();
  syncCostInputs();
  renderResults();
}

ingredientRows.addEventListener('input', (event) => {
  const input = event.target.closest('input[data-field]');
  const row = event.target.closest('[data-ingredient-id]');
  if (!input || !row) return;

  const ingredientId = Number(row.dataset.ingredientId);
  state = {
    ...state,
    ingredients: state.ingredients.map((ingredient) => (
      ingredient.id === ingredientId
        ? { ...ingredient, [input.dataset.field]: input.value }
        : ingredient
    )),
  };
  showValidation = true;
  renderResults();
});

ingredientRows.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-ingredient]');
  if (!button) return;

  state = removeIngredient(state, Number(button.dataset.removeIngredient));
  showValidation = true;
  renderAll();
});

Object.entries(costInputs).forEach(([key, input]) => {
  input.addEventListener('input', () => {
    state = { ...state, [key]: input.value };
    showValidation = true;
    renderResults();
  });
});

document.querySelector('#add-ingredient').addEventListener('click', () => {
  state = addIngredient(state);
  showValidation = true;
  renderAll();
  ingredientRows.querySelector('tr:last-child input')?.focus();
});

document.querySelector('#load-example').addEventListener('click', () => {
  state = createExampleState();
  showValidation = false;
  renderAll();
});

document.querySelector('#reset-calculator').addEventListener('click', () => {
  state = createResetState();
  showValidation = false;
  renderAll();
  ingredientRows.querySelector('input')?.focus();
});

renderAll();

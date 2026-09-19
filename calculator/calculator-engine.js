const INCLUSION_TOLERANCE = 1e-9;

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseNonNegative(value, key, label, errors) {
  if (value === '' || value === null || value === undefined) return 0;
  if (typeof value === 'string' && value.trim() === '') return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors[key] = `${label} must be a non-negative number.`;
    return 0;
  }

  return parsed;
}

function parseMargin(value, errors) {
  if (value === '' || value === null || value === undefined) return 0;
  if (typeof value === 'string' && value.trim() === '') return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed >= 100) {
    errors.grossMargin = 'Gross margin must be at least 0% and less than 100%.';
    return 0;
  }

  return parsed;
}

function inclusionMessage(totalInclusion) {
  const difference = totalInclusion - 100;
  if (Math.abs(difference) <= INCLUSION_TOLERANCE) return '';

  if (difference < 0) {
    return `Mixture is ${Math.abs(difference).toFixed(2)} percentage points short of 100%.`;
  }

  return `Mixture exceeds 100% by ${difference.toFixed(2)} percentage points.`;
}

export function calculateFeedCost(input = {}) {
  const errors = {};
  const ingredients = Array.isArray(input.ingredients) ? input.ingredients : [];
  const parsedIngredients = ingredients.map((ingredient = {}, index) => ({
    name: String(ingredient.name ?? '').trim(),
    inclusion: parseNonNegative(
      ingredient.inclusion,
      `ingredients.${index}.inclusion`,
      'Inclusion',
      errors,
    ),
    price: parseNonNegative(
      ingredient.price,
      `ingredients.${index}.price`,
      'Price',
      errors,
    ),
  }));

  parsedIngredients.forEach((ingredient, index) => {
    if (!ingredient.name) {
      errors[`ingredients.${index}.name`] = 'Ingredient name is required.';
    }
  });

  const manufacturingCost = parseNonNegative(
    input.manufacturingCost,
    'manufacturingCost',
    'Manufacturing cost',
    errors,
  );
  const transportCost = parseNonNegative(
    input.transportCost,
    'transportCost',
    'Transport cost',
    errors,
  );
  const otherCost = parseNonNegative(
    input.otherCost,
    'otherCost',
    'Other cost',
    errors,
  );
  const grossMargin = parseMargin(input.grossMargin, errors);

  const contributions = parsedIngredients.map(
    ({ inclusion, price }) => (inclusion / 100) * price,
  );
  const totalInclusion = parsedIngredients.reduce(
    (sum, ingredient) => sum + ingredient.inclusion,
    0,
  );
  const ingredientCost = contributions.reduce(
    (sum, contribution) => sum + contribution,
    0,
  );
  const additionalCosts = manufacturingCost + transportCost + otherCost;
  const productionCost = ingredientCost + additionalCosts;
  const ok = Object.keys(errors).length === 0;
  const sellingPrice = ok
    ? productionCost / (1 - grossMargin / 100)
    : null;
  const grossProfit = ok ? sellingPrice - productionCost : null;

  return {
    ok,
    errors,
    contributions,
    totalInclusion,
    inclusionWarning: inclusionMessage(totalInclusion),
    ingredientCost,
    additionalCosts,
    productionCost,
    sellingPrice,
    grossProfit,
    equivalentMarkup: ok && productionCost !== 0
      ? (grossProfit / productionCost) * 100
      : 0,
  };
}

export function formatRand(value) {
  return `R ${numberFormatter.format(value)}`;
}

export function formatPercent(value) {
  return `${numberFormatter.format(value)}%`;
}

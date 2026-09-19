function blankIngredient(id) {
  return {
    id,
    name: '',
    inclusion: '',
    price: '',
  };
}

export function createResetState() {
  return {
    ingredients: [blankIngredient(1)],
    manufacturingCost: 0,
    transportCost: 0,
    otherCost: 0,
    grossMargin: 0,
    nextId: 2,
  };
}

export function createExampleState() {
  return {
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
  };
}

export function addIngredient(state) {
  return {
    ...state,
    ingredients: [...state.ingredients, blankIngredient(state.nextId)],
    nextId: state.nextId + 1,
  };
}

export function removeIngredient(state, id) {
  const ingredients = state.ingredients.filter((ingredient) => ingredient.id !== id);

  if (ingredients.length > 0) {
    return { ...state, ingredients };
  }

  return {
    ...state,
    ingredients: [blankIngredient(state.nextId)],
    nextId: state.nextId + 1,
  };
}

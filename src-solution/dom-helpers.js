const errorMessage = document.querySelector('#error-message');
const detailsSection = document.querySelector('#recipe-details');
const recipesList = document.querySelector('#recipes-list');
const recipeCount = document.querySelector('#recipe-count');

export const renderRecipes = (recipes) => {
  // Clear the old list before rendering the new one
  recipesList.innerHTML = '';
  recipeCount.textContent = recipes.length;

  recipes.forEach((recipe) => {
    const li = document.createElement('li');

    // store the recipe id to make fetching its data easier
    li.dataset.recipeId = recipe.id;

    const img = document.createElement('img');
    img.src = recipe.image;
    img.alt = recipe.name;

    const h3 = document.createElement('h3');
    h3.textContent = recipe.name;

    const info = document.createElement('p');
    info.textContent = `${recipe.cuisine} · ${recipe.difficulty}`;

    li.append(img, h3, info);
    recipesList.append(li);
  });
};

export const renderRecipeDetails = (recipe) => {
  // Clear old details and show the section
  detailsSection.classList.remove('hidden');
  detailsSection.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = recipe.name;

  const img = document.createElement('img');
  img.src = recipe.image;
  img.alt = recipe.name;

  const info = document.createElement('p');
  info.textContent = `${recipe.cuisine} · ${recipe.difficulty} · ${recipe.cookTimeMinutes + recipe.prepTimeMinutes} min · ${recipe.rating}/5`;

  const ingredientsH3 = document.createElement('h3');
  ingredientsH3.textContent = 'Ingredients';

  const ingredientsList = document.createElement('ul');
  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientsList.append(li);
  });

  detailsSection.append(h2, img, info, ingredientsH3, ingredientsList);
};

export const renderError = (msg) => {
  errorMessage.classList.remove('hidden');
  errorMessage.textContent = msg;
}

export const hideError = () => {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}
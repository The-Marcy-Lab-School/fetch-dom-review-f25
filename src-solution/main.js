import { getRecipes, getRecipeById, getRecipeBySearchTerm } from './fetch-helpers.js';
import { renderRecipes, renderRecipeDetails, renderError, hideError } from './dom-helpers.js';

// Fetch and render recipes on page load
getRecipes().then((recipes) => {
  if (recipes === null) {
    renderError('Failed to load recipes.');
  } else {
    hideError();
    renderRecipes(recipes);
  }
});

// Event delegation: click a recipe to see its details
const recipesList = document.querySelector('#recipes-list');
recipesList.addEventListener('click', (event) => {
  const li = event.target.closest('li');
  if (!li) return;

  getRecipeById(li.dataset.recipeId).then((recipe) => {
    if (recipe === null) {
      renderError('Failed to load recipe details.');
    } else {
      hideError();
      renderRecipeDetails(recipe);
    }
  });
});

// Form Handling
const form = document.querySelector("#search-form");
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const searchTerm = form.elements.searchTerm.value;
  const isQuick = form.elements.isQuick.checked; // <-- checkboxes need .checked

  const { data, error } = await getRecipeBySearchTerm(searchTerm);
  if (error) {
    renderError(`Failed to find recipes. Try again later. Error: ${error.message}`);
  }
  else if (data.length === 0) {
    renderError('Could not find recipes matching that search term.');
  }
  else {
    let recipes = data;
    if (isQuick) {
      recipes = data.filter((recipe) => (recipe.prepTimeMinutes + recipe.cookTimeMinutes) <= 20);
    }
    hideError();
    renderRecipes(recipes);
  }
});
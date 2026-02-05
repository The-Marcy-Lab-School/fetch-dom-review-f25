import { getRecipes, getRecipeById } from './fetch-helpers.js';
import { renderRecipes, renderRecipeDetails, renderError } from './dom-helpers.js';

// Fetch and render recipes on page load
getRecipes().then((recipes) => {
  if (recipes === null) {
    renderError('Failed to load recipes.');
  } else {
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
      renderRecipeDetails(recipe);
    }
  });
});

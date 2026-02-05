# Review Session: Recipe Browser

A live-coding review app that covers DOM manipulation, fetching with `.then()`/`.catch()`, ES Modules, event delegation, and `dataset`. The completed solution is in `src-solution/`.

**API:** https://dummyjson.com/recipes

- [Setup](#setup)
- [Walkthrough](#walkthrough)
  - [Step 0: Tour the starter code](#step-0-tour-the-starter-code)
  - [Step 1: Create `src/fetch-helpers.js` — fetch a list of recipes](#step-1-create-srcfetch-helpersjs--fetch-a-list-of-recipes)
  - [Step 2: Import and test in `main.js`](#step-2-import-and-test-in-mainjs)
  - [Step 3: Create `src/dom-helpers.js` — render the recipe list](#step-3-create-srcdom-helpersjs--render-the-recipe-list)
  - [Step 4: Wire up rendering in `main.js`](#step-4-wire-up-rendering-in-mainjs)
  - [Step 5: Add `getRecipeById` to `fetch-helpers.js`](#step-5-add-getrecipebyid-to-fetch-helpersjs)
  - [Step 6: Add the click handler with event delegation](#step-6-add-the-click-handler-with-event-delegation)
  - [Step 7: Add `renderRecipeDetails` to `dom-helpers.js`](#step-7-add-renderrecipedetails-to-dom-helpersjs)
  - [Step 8 (Bonus): Add error rendering](#step-8-bonus-add-error-rendering)
- [Concepts Checklist](#concepts-checklist)


## Setup

```sh
npm i
npm run dev
```

## Walkthrough

### Step 0: Tour the starter code

Walk through the provided files before writing any JavaScript:

- **`index.html`** — Point out:
  - `<script type="module" src="./src/main.js">` at the bottom (entry point, `type="module"` enables imports)
  - The hardcoded fallback recipe card in the `ul` (what users see before JS loads or if the fetch fails)
  - The `#recipe-details` section with `class="hidden"` (hidden by default, we'll show it on click)
  - The `#error-message` paragraph with `class="hidden"`
  - The `data-recipe-id="1"` attribute on the fallback `li` — explain that we'll use this pattern on dynamically created elements too
- **`styles.css`** — Point out the `.hidden { display: none !important; }` class
- **`src/main.js`** — Currently empty. This is where we'll work.

### Step 1: Create `src/fetch-helpers.js` — fetch a list of recipes

> **Skills:** fetch, `.then()`, `.catch()`, `response.ok`, named exports, returning from `.then()`

Create the file and write `getRecipes`:

```js
export const getRecipes = () => {
  return fetch('https://dummyjson.com/recipes?limit=9')
    .then((response) => {
      if (!response.ok) {
        throw Error(`Fetch failed. ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      return data.recipes;
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
};
```

**Talk through:**
- `fetch()` returns a Promise. We chain `.then()` to handle it.
- Why we check `response.ok` — fetch doesn't reject on 404/500, only on network errors.
- `response.json()` also returns a Promise — we must `return` it so the next `.then()` gets the data.
- The API returns `{ recipes: [...], total, ... }` so we extract just `data.recipes`.
- On error, we `return null` so the caller can check for failure.
- `export` makes this available to other files.

### Step 2: Import and test in `main.js`

> **Skills:** named imports with `.js` extension, `.then()` on a returned Promise

```js
import { getRecipes } from './fetch-helpers.js';

getRecipes().then((recipes) => {
  console.log(recipes);
});
```

**Check the console.** You should see an array of 9 recipe objects. Point out the structure: `id`, `name`, `image`, `cuisine`, `difficulty`, etc.

### Step 3: Create `src/dom-helpers.js` — render the recipe list

> **Skills:** `document.createElement`, `element.append`, `dataset`, `innerHTML = ''`, named exports, looping over data

```js
export const renderRecipes = (recipes) => {
  const recipesList = document.querySelector('#recipes-list');
  const recipeCount = document.querySelector('#recipe-count');

  // Clear the old content before rendering new content
  recipesList.innerHTML = '';
  recipeCount.textContent = recipes.length;

  recipes.forEach((recipe) => {
    const li = document.createElement('li');
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
```

**Talk through:**
- `innerHTML = ''` clears the hardcoded fallback card so we can replace it with real data.
- `dataset.recipeId` sets `data-recipe-id` on the element — we'll read this later when the user clicks.
- Create → Modify → Append pattern for each element.
- `li.append(img, h3, info)` assembles the card, then `recipesList.append(li)` puts it on the page.

### Step 4: Wire up rendering in `main.js`

> **Skills:** importing from multiple modules, null-checking fetch results

```js
import { getRecipes } from './fetch-helpers.js';
import { renderRecipes } from './dom-helpers.js';

getRecipes().then((recipes) => {
  if (recipes === null) {
    console.log('Failed to load recipes.');
    return;
  }
  renderRecipes(recipes);
});
```

**Check the browser.** The 9 recipe cards should replace the single fallback card. If you break the URL in `fetch-helpers.js`, the fallback card stays and the error prints to the console.

### Step 5: Add `getRecipeById` to `fetch-helpers.js`

> **Skills:** dynamic URL with template literal, same fetch pattern

```js
export const getRecipeById = (id) => {
  return fetch(`https://dummyjson.com/recipes/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw Error(`Fetch failed. ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error(error.message);
      return null;
    });
};
```

**Talk through:** Same pattern as `getRecipes` but with a dynamic `id` in the URL. No need to extract a nested property — the API returns the recipe object directly.

### Step 6: Add the click handler with event delegation

> **Skills:** event delegation, `event.target.closest()`, reading `dataset`, second fetch + render

Back in `main.js`, add below the existing code:

```js
import { getRecipes, getRecipeById } from './fetch-helpers.js';
import { renderRecipes, renderRecipeDetails } from './dom-helpers.js';

// ... existing getRecipes code ...

// Event delegation: click a recipe to see its details
const recipesList = document.querySelector('#recipes-list');
recipesList.addEventListener('click', (event) => {
  const li = event.target.closest('li');
  if (!li) return;

  getRecipeById(li.dataset.recipeId).then((recipe) => {
    if (recipe === null) {
      console.log('Failed to load recipe details.');
      return;
    }
    renderRecipeDetails(recipe);
  });
});
```

**Talk through:**
- One listener on the `ul`, not one per `li` — this is **event delegation**.
- `event.target` is whatever was actually clicked (could be the `img`, `h3`, or `p` inside the `li`).
- `event.target.closest('li')` walks up the DOM to find the `li` ancestor.
- `if (!li) return` — guard clause in case the user clicks the gap between cards.
- We read `li.dataset.recipeId` — this is the `data-recipe-id` attribute we set during rendering.

This will error because `renderRecipeDetails` doesn't exist yet. That's the next step.

### Step 7: Add `renderRecipeDetails` to `dom-helpers.js`

> **Skills:** clearing and showing a hidden section, rendering nested data (ingredients list)

```js
export const renderRecipeDetails = (recipe) => {
  const detailsSection = document.querySelector('#recipe-details');
  detailsSection.classList.remove('hidden');

  // Clear old details before rendering new ones
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
```

**Talk through:**
- `classList.remove('hidden')` makes the section visible (it starts with `class="hidden"` in the HTML).
- `innerHTML = ''` clears the previous recipe's details before rendering the new one.
- Same create/modify/append pattern, just more elements.
- The ingredients list is a loop-within-a-render — create an `li` for each ingredient string.

**Check the browser.** Click a recipe card — the details section should appear above with the recipe's full info.

### Step 8 (Bonus): Add error rendering

> **Skills:** DOM manipulation, `setTimeout` for timed behavior

Add to `dom-helpers.js`:

```js
const errorMessage = document.querySelector('#error-message');

export const renderError = (msg) => {
  errorMessage.classList.remove('hidden');
  errorMessage.textContent = msg;
  setTimeout(() => {
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
  }, 2000);
};
```

Then update `main.js` to use `renderError(...)` instead of `console.log(...)` for the null checks.

## Concepts Checklist

By the end of this walkthrough, you've demonstrated:

- [ ] Vite dev server and `<script type="module">`
- [ ] ES Modules: `export` and `import` with `.js` extension
- [ ] Separation of concerns: `fetch-helpers.js`, `dom-helpers.js`, `main.js`
- [ ] `fetch()` with `.then()` and `.catch()`
- [ ] Checking `response.ok` and throwing errors
- [ ] Returning from `.then()` to chain promises
- [ ] Returning `null` on error so the caller can handle failure
- [ ] `document.createElement` + modify + `append` pattern
- [ ] `innerHTML = ''` to clear a container before re-rendering
- [ ] `dataset` to store data on elements
- [ ] Event delegation with `addEventListener` on a parent
- [ ] `event.target.closest('li')` to find the clicked element
- [ ] Reading `dataset` from clicked elements to fetch more data

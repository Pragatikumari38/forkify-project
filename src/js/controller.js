import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

//////////////////////////////////

const controlRecipes = async function (params) {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //  0. update results view tomark selected search result
    resultsView.update(model.getSearchResultsPage());

    //  1. updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //  2. Loading recipe
    await model.loadRecipe(id);

    //  3. rendering recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // get search query
    const query = searchView.getQuery();
    if (!query) return;

    // load search results
    await model.loadSearchResults(query);

    // render results
    resultsView.render(model.getSearchResultsPage());

    // render initial pagination button
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  // render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render NEW pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);

  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //  1. add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //  2. update recipe view
  recipeView.update(model.state.recipe);

  // 3. render boomarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //  show loading spinner
    addRecipeView.renderSpinner();

    //  upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //   render recipe
    recipeView.render(model.state.recipe);

    //  success message
    addRecipeView.renderMessage();

    //  render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //  change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //  close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);

  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application!');
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();

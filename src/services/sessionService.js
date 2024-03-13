let searchResults = [];
let shoppingList = [];

export const getSearchResults = () => {
  return searchResults;
};

export const setSearchResults = (results) => {
  searchResults = results;
};

export const getShoppingList = () => {
  return shoppingList;
};

export const addToShoppingList = (product, quantity) => {
  const existingProduct = shoppingList.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    shoppingList.push({ ...product, quantity });
  }
};

export const removeFromShoppingList = (index) => {
  shoppingList.splice(index, 1);
};
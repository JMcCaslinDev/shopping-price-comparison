import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import ShoppingList from './components/ShoppingList';
import { getProductsByKeyword } from './services/productService';
import './App.css';


function App() {
  const [products, setProducts] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);

  const handleSearch = async (term) => {
    const searchResults = await getProductsByKeyword(term);
    setProducts(searchResults);
  };

  const handleAddToCart = (product, quantity) => {
    const updatedShoppingList = [...shoppingList, { ...product, quantity }];
    setShoppingList(updatedShoppingList);
  };

  const handleRemoveFromCart = (index) => {
    const updatedShoppingList = [...shoppingList];
    updatedShoppingList.splice(index, 1);
    setShoppingList(updatedShoppingList);
  };

  return (
    <div className="App">
      <Header />
      <Container>
        <SearchBar onSearch={handleSearch} />
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
        />
        <ShoppingList
          shoppingList={shoppingList}
          onRemoveFromCart={handleRemoveFromCart}
        />
      </Container>
    </div>
  );
}

export default App;
import React from 'react';
import { Container } from 'react-bootstrap';
import StoreGrouping from './StoreGrouping';

const ProductList = ({ products, onAddToCart }) => {
  return (
    <Container>
      <StoreGrouping products={products} onAddToCart={onAddToCart} />
    </Container>
  );
};

export default ProductList;
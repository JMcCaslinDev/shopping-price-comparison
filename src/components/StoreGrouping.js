import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductCard from './ProductCard';

const StoreGrouping = ({ products, onAddToCart }) => {
  const groupedProducts = products.reduce((groups, product) => {
    const store = product.store;
    if (!groups[store]) {
      groups[store] = [];
    }
    groups[store].push(product);
    return groups;
  }, {});

  return (
    <>
      {Object.entries(groupedProducts).map(([store, products]) => (
        <div key={store} className="store-grouping">
          <h4>{store}</h4>
          <Row>
            {products.map((product) => (
              <Col key={product.itemId} md={4}>
                <ProductCard product={product} onAddToCart={onAddToCart} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </>
  );
};

export default StoreGrouping;
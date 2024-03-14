import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ProductCard = ({ product, onAddToCart }) => {
  const { name, salePrice, shortDescription, thumbnailImage, quantity, unit, unitPrice } = product;

  const handleAddToCart = () => {
    onAddToCart(product, 1); // Default quantity is 1
  };

  return (
    <Card className="mb-3 product-card">
      <Card.Img variant="top" src={thumbnailImage} alt={name} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        {/* <Card.Text>{shortDescription}</Card.Text> */}
        <Card.Text>Price: {salePrice ? `$${salePrice.toFixed(2)}` : 'N/A'}</Card.Text>
        <Card.Text>Total Quantity: {quantity} {unit}</Card.Text>
        <Card.Text>Unit Price: {unitPrice ? `$${unitPrice}` : 'N/A'}</Card.Text>
        <Button variant="primary" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
import React from 'react';
import { Table, Button } from 'react-bootstrap';

const ShoppingList = ({ shoppingList, onRemoveFromCart }) => {
  const totalCost = shoppingList.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h4>Shopping List</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Store</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {shoppingList.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>{item.store}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => onRemoveFromCart(index)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h5>Total Cost: ${totalCost.toFixed(2)}</h5>
    </div>
  );
};

export default ShoppingList;
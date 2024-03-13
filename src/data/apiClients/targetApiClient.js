// src/data/apiClients/targetApiClient.js
import axios from 'axios';
import log from '../../utils/logger';

const targetApiKey = process.env.REACT_APP_TARGET_API_KEY;

export const fetchProductsByKeyword = async (keyword) => {
  try {
    const response = await axios.get(
      `https://api.target.com/products/v3/product.json?fields=descriptions,pricing&keyword=${keyword}&key=${targetApiKey}`
    );
    return response.data.products;
  } catch (error) {
    log.error('Error fetching products from Target API:', error);
    return [];
  }
};

export const fetchProductById = async (productId) => {
  try {
    const response = await axios.get(
      `https://api.target.com/products/v3/${productId}?fields=descriptions,pricing&key=${targetApiKey}`
    );
    return response.data.product;
  } catch (error) {
    log.error('Error fetching product from Target API:', error);
    return null;
  }
};
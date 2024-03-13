import { searchWalmartProducts } from '../data/apiClients/walmartApiClient';

export const getProductsByKeyword = async (keyword) => {
  try {
    const products = await searchWalmartProducts(keyword);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};
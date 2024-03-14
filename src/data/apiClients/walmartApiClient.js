import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

export const searchWalmartProducts = async (keyword) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/search?keyword=${keyword}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Walmart products:', error);
    return [];
  }
};


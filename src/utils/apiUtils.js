import axios from 'axios';

export const makeApiRequest = async (url, method = 'GET', data = null) => {
  try {
    const response = await axios({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error making API request:', error);
    throw error;
  }
};
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

dotenv.config();

// Axios Interceptors setup
axios.interceptors.request.use(config => {
  // Log the full request configuration
  console.log('Request sent with config:', config);
  return config;
}, error => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.log('Response received:', response);
  return response;
}, error => {
  console.error('Response error:', error);
  return Promise.reject(error);
});

const app = express();
app.use(cors());

const WALMART_API_BASE_URL = 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2';
const WALMART_CONSUMER_ID = process.env.WALMART_CONSUMER_ID;
const WALMART_PRIVATE_KEY = fs.readFileSync(process.env.WALMART_PRIVATE_KEY_PATH, 'utf8');
const WALMART_KEY_VERSION = '1';

// console.log("\n WALMART_CONSUMER_ID:", WALMART_CONSUMER_ID, "\n");
// console.log("\n WALMART_PRIVATE_KEY:", WALMART_PRIVATE_KEY, "\n");

function generateWalmartSignature(consumerId, privateKey, timestamp) {
  const data = consumerId + '\n' + timestamp + '\n' + WALMART_KEY_VERSION + '\n';
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKey, 'base64');
//   console.log(`\n\nGenerated Signature: ${signature}\n\n`); // Debugging line
  return signature;
}

function generateWalmartHeaders() {
  const timestamp = Date.now().toString();
  const signature = generateWalmartSignature(WALMART_CONSUMER_ID, WALMART_PRIVATE_KEY, timestamp);

  return {
    'WM_CONSUMER.ID': WALMART_CONSUMER_ID,
    'WM_CONSUMER.INTIMESTAMP': timestamp,
    'WM_SEC.AUTH_SIGNATURE': signature,
    'WM_SEC.KEY_VERSION': WALMART_KEY_VERSION,
  };
}

app.get('/api/search', async (req, res) => {
    try {
      const { keyword } = req.query;
      const headers = generateWalmartHeaders();
      const response = await axios.get(`${WALMART_API_BASE_URL}/search`, {
        params: {
          query: keyword,
        },
        headers: headers,
      });
  
      const items = response.data.items.map(item => {
        console.log('Item details:', item); // Add this line to log item details
        return {
          name: item.name,
          salePrice: item.salePrice,
          shortDescription: item.shortDescription,
          thumbnailImage: item.thumbnailImage,
          standardUpc: item.standardUpc, // Add this line to include standardUpc
          uom: item.uom, // Add this line to include uom
        };
      });
  
      res.json(items);
    } catch (error) {
      console.error('Error fetching Walmart products:', error.message);
      console.error('Error details:', error.response ? error.response.data : 'No response data available');
      res.status(500).json({ error: 'An error occurred while fetching Walmart products' });
    }
  });

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

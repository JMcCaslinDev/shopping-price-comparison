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

function generateWalmartSignature(consumerId, privateKey, timestamp) {
  const data = consumerId + '\n' + timestamp + '\n' + WALMART_KEY_VERSION + '\n';
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKey, 'base64');
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

function extractQuantityAndUnit(item) {
    const fields = [item.name, item.shortDescription, item.longDescription];
    let quantity = 0;
    let unit = 'count';

    // Check if the item attributes contain a count_per_pack and multipack_quantity.
    if (item.attributes && item.attributes.count_per_pack) {
        quantity = parseInt(item.attributes.count_per_pack, 10);
        const multipackQuantity = item.attributes.multipack_quantity ? parseInt(item.attributes.multipack_quantity, 10) : 1;
        quantity *= multipackQuantity;
        console.log(`Item: ${item.name}, count_per_pack: ${quantity}, multipack_quantity: ${multipackQuantity}`);
    } else {
        // Check the description fields for quantity information.
        const patterns = [
            /(\d+)\s*(tissues|sheets|pieces|units)\s*(?:per|\/)\s*(box|cube|pack)/i,
            // ... (other patterns as before)
        ];

        for (const field of fields) {
            if (field) {
                for (const pattern of patterns) {
                    const match = field.match(pattern);
                    if (match) {
                        quantity = parseInt(match[1], 10);
                        unit = match[2];
                        break;
                    }
                }
            }
            if (quantity > 0) {
                break; // Break if quantity has been found.
            }
        }
    }

    if (quantity === 0) {
        console.error(`No quantity found for item: ${item.name}`);
        return null;
    } else {
        console.log(`Found quantity for item: ${item.name}, Quantity: ${quantity}, Unit: ${unit}`);
        return { quantity, unit };
    }
}

  


  app.get('/api/search', async (req, res) => {
    try {
      const { keyword } = req.query;
      const headers = generateWalmartHeaders();
  
      console.group(`API Call: ${keyword}`);
      const response = await axios.get(`${WALMART_API_BASE_URL}/search`, {
        params: {
          query: keyword,
        },
        headers: headers,
      });
      console.groupEnd();
  
      const items = response.data.items.map(item => {
        console.group(`Item: ${item.name}`);
        const quantityInfo = extractQuantityAndUnit(item);
  
        // Calculate the unit price if quantity info is available
        let unitPrice = null;
        let pricePerHundred = null;
        if (quantityInfo && item.salePrice) {
          unitPrice = (item.salePrice / quantityInfo.quantity).toFixed(2);
          pricePerHundred = (item.salePrice / quantityInfo.quantity * 100).toFixed(2);
        }
  
        console.log(`Debug: unitPrice: $${unitPrice}, pricePerHundred: $${pricePerHundred}`);
        console.groupEnd();
  
        return {
          name: item.name,
          salePrice: item.salePrice,
          shortDescription: item.shortDescription,
          thumbnailImage: item.thumbnailImage,
          quantity: quantityInfo ? quantityInfo.quantity : null,
          unit: quantityInfo ? quantityInfo.unit : null,
          unitPrice: unitPrice,
          pricePerHundred: pricePerHundred, // Add this line to include price per 100 count
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
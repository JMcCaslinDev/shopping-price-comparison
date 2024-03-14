const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

dotenv.config();

axios.interceptors.request.use(config => {
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

function extractQuantityInfo(item) {
  const fields = [item.name, item.shortDescription, item.longDescription];
  let containerCount = 0;
  let unitCount = 0;
  let totalCount = 0;
  let unit = 'count';

  const containerPatterns = [
    /(\d+)\s*(?:flat|cube|pack|boxes?|containers?)/i,
  ];

  const unitPatterns = [
    /(\d+)\s*(?:tissues|sheets|pieces|units|wipes|napkins)/i,
    /(\d+)\s*(?:tissues|sheets|pieces|units|wipes|napkins)\s*(?:per|\/)\s*(?:box|cube|pack|container)/i,
  ];

  const totalPatterns = [
    /(\d+)\s*(?:total|count)\s*(?:tissues|sheets|pieces|units|wipes|napkins)/i,
  ];

  for (const field of fields) {
    if (field) {
      if (containerCount === 0) {
        for (const pattern of containerPatterns) {
          const match = field.match(pattern);
          if (match) {
            containerCount = parseInt(match[1], 10);
            break;
          }
        }
      }

      if (unitCount === 0) {
        for (const pattern of unitPatterns) {
          const match = field.match(pattern);
          if (match) {
            unitCount = parseInt(match[1], 10);
            break;
          }
        }
      }

      if (totalCount === 0) {
        for (const pattern of totalPatterns) {
          const match = field.match(pattern);
          if (match) {
            totalCount = parseInt(match[1], 10);
            break;
          }
        }
      }
    }

    if ((containerCount > 0 && unitCount > 0) || totalCount > 0) {
      break;
    }
  }

  if (totalCount === 0) {
    totalCount = containerCount * unitCount;
  }

  if (totalCount === 0) {
    console.error(`No quantity found for item: ${item.name}`);
    return null;
  } else {
    console.log(`Found quantity for item: ${item.name}, Container Count: ${containerCount}, Unit Count: ${unitCount}, Total Count: ${totalCount}, Unit: ${unit}`);
    return { containerCount, unitCount, totalCount, unit };
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
      const quantityInfo = extractQuantityInfo(item);

      let unitPrice = null;
      if (quantityInfo && item.salePrice) {
        unitPrice = (item.salePrice / quantityInfo.totalCount).toFixed(2);
      }

      console.log(`Debug: unitPrice: $${unitPrice}`);
      console.groupEnd();

      return {
        name: item.name,
        salePrice: item.salePrice,
        shortDescription: item.shortDescription,
        thumbnailImage: item.thumbnailImage,
        containerCount: quantityInfo ? quantityInfo.containerCount : null,
        unitCount: quantityInfo ? quantityInfo.unitCount : null,
        totalCount: quantityInfo ? quantityInfo.totalCount : null,
        unit: quantityInfo ? quantityInfo.unit : null,
        unitPrice: unitPrice,
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
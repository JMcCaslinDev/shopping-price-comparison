const axios = require('axios');
const generateWalmartHeaders = require('./walmartHeaders');
const extractQuantityInfo = require('./extractQuantityInfo');

const WALMART_API_BASE_URL = 'https://developer.api.walmart.com/api-proxy/service/affil/product/v2';

async function searchProducts(req, res) {
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
      console.log("Items: ", response.data);
      const quantityInfo = extractQuantityInfo(item);

      let unitPrice = null;
      if (quantityInfo && item.salePrice) {
        unitPrice = (item.salePrice / quantityInfo.totalCount).toFixed(3);
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
}

module.exports = searchProducts;
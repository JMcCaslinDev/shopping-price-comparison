import axios from 'axios';
import cheerio from 'cheerio';

const BASE_URL = 'https://www.target.com';

export const searchProducts = async (keyword) => {
  try {
    const response = await axios.get(`${BASE_URL}/s?searchTerm=${keyword}`);
    const html = response.data;
    const $ = cheerio.load(html);

    const products = [];

    $('a.Link-sc-1khjl8b-0').each((index, element) => {
      const product = {
        name: $(element).find('div.h-display-block').text().trim(),
        price: $(element).find('div.h-padding-r-tiny').text().trim(),
        url: `${BASE_URL}${$(element).attr('href')}`,
      };
      products.push(product);
    });

    return products;
  } catch (error) {
    console.error('Error scraping Target products:', error);
    return [];
  }
};
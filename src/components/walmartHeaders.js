const crypto = require('crypto');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

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

module.exports = generateWalmartHeaders;
const express = require('express');
const cors = require('cors');
const searchProducts = require('./src/components/searchProducts');

const app = express();
app.use(cors());


//  Personal api to bypass cors protection and communicate with walmarts api
app.get('/api/search', searchProducts);


const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
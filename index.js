const express = require('express');
const connectDb = require('./config/db');
const config = require('config');

const app = express();

// connect to database
connectDb();

app.use(express.json({ extended: false }));

// define routes
app.use('/', require('./routes/url'));

// driver code
const port = config.get('port');
app.listen(port, () => {
  console.log(`Service endpoint http://localhost:${port}`);
});

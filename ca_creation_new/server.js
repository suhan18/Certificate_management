const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const caRoutes = require('./routes/ca');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/ca', caRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

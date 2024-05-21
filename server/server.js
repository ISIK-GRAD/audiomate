const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/index');
const User = require('./models/user');
const bcrypt = require('bcrypt'); // Import bcrypt
const api = require('./api/api');

// Sync all models
sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error syncing the database:', err);
  });

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

api.getEndPoints.forEach((endpoint) => {
  app.get(endpoint, api.getEndPoints[endpoint]);
});

api.postEndPoints.forEach((endpoint) => {
  app.post(endpoint, api.postEndPoints[endpoint]);
});

// Define a POST endpoint for signin


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Close the connection gracefully when the server is terminated
process.on('SIGINT', () => {
  sequelize.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

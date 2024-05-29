const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/index');
const User = require('./models/user');
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

Object.entries(api.getEndPoints).forEach(([endpoint, {func, middleware}]) => {
  middleware ? app.get(endpoint, middleware, func) : app.get(endpoint, func);
});

Object.entries(api.postEndPoints).forEach(([endpoint, {func, middleware}]) => {
  middleware ? app.post(endpoint, middleware, func) : app.post(endpoint, func);
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

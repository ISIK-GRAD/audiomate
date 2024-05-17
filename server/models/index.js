const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize('audiomateUSERS', 'root', 'root', {
  host: 'localhost',
  port: 8889,
  dialect: 'mysql'
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;

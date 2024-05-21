const { Sequelize } = require('sequelize');
const databaseConfig = require("../config/databaseConfig.json");


// Initialize Sequelize
const sequelize = new Sequelize(
  databaseConfig.databaseName, 
  databaseConfig.user, 
  databaseConfig.password, 
  {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: 'mysql'
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;

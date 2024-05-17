const { DataTypes } = require('sequelize');
const sequelize = require('./index'); 

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'userCredentials',
  timestamps: false
});

module.exports = User;

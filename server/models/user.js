const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
    timestamps: true
  });

  return User;
};


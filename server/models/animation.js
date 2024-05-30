const { DataTypes } = require('sequelize');
const sequelize = require('./index'); 

module.exports = (sequelize) => {
    const Animation = sequelize.define('Animation', {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        animationType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        settings: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        createdBy: {
          type: DataTypes.STRING,
          allowNull: false,
          references: {
            model: 'userCredentials', 
            key: 'email', 
          }
        }
      }, {
        tableName: 'animations',
        timestamps: true 
      });

    return Animation;
}

  
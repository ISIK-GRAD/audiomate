module.exports = (sequelize) => {
    const { User, Animation } = sequelize.models;
  
    User.hasMany(Animation, { foreignKey: 'createdBy' });
    Animation.belongsTo(User, { foreignKey: 'createdBy' });
  };
const {sequelize , DataTypes} = require('./db')

const Operation = sequelize.define('Operation', {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cost: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  
});


module.exports = Operation
const {sequelize , DataTypes} = require('./db')

const TransactionType = sequelize.define('TransactionType', {
  name:{
    type: DataTypes.STRING
  }, 
  sign: {
    type: DataTypes.SMALLINT
  }
}, {
  
});

module.exports = TransactionType
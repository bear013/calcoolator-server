const {sequelize , DataTypes} = require('./db')
const User = require('./User')
const Operation = require('./Operation')
const TransactionType = require('./TransactionType')

const Transaction = sequelize.define('Transaction', {
  active: {
    type: DataTypes.BOOLEAN
  },
  operation_response: {
    type: DataTypes.STRING
  },
  operation_date:{
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  amount:{
    type: DataTypes.BIGINT
  }
}, {
  paranoid: true
});

User.hasMany(Transaction)
Transaction.belongsTo(User)
Operation.hasMany(Transaction)
Transaction.belongsTo(Operation)
TransactionType.hasMany(Transaction)
Transaction.belongsTo(TransactionType)

module.exports = Transaction
const {sequelize , DataTypes} = require('./db')
const User = require('./User')
const Operation = require('./Operation')

/*id INTEGER PRIMARY KEY AUTOINCREMENT,
operation_id INT NOT NULL,
user_id INT NOT NULL,
amount INT NOT NULL,
user_balance INT NOT NULL,
operation_response VARCHAR(256) NOT NULL,
operation_date DATETIME NOT NULL,
active INT NOT NULL
*/

const Transaction = sequelize.define('Transaction', {
  active: {
    type: DataTypes.BOOLEAN
  },
  operation_response: {
    type: DataTypes.STRING
  },
  operation_date:{
    type: DataTypes.DATE
  },
  amount:{
    type: DataTypes.BIGINT
  }
}, {
  
});

Transaction.hasOne(Operation);
User.hasMany(Transaction)
Transaction.belongsTo(User)

module.exports = Transaction
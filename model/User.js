const {sequelize , DataTypes} = require('./db.cjs')

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN
  },
  email: {
    type: DataTypes.STRING
  }
}, {
  
});


module.exports = {
  User

}


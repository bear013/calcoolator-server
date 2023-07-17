const {sequelize , DataTypes} = require('./db')

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  
});


module.exports = User


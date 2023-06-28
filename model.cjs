const { Sequelize,Model,DataTypes } = require('sequelize');
const SQLite = require('sqlite3');
const config = require('./config/config.cjs')

const dbLocation = config.dbLocation;

const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: dbLocation, 
  dialectOptions: {
    mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE 
  },
});

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

User.sync({ alter: true })

module.exports = {
  User:User

}


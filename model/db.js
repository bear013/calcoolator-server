const { Sequelize,DataTypes } = require('sequelize');
const SQLite = require('sqlite3');
const config = require('../config/config.js')

const dbLocation = config.dbLocation;

const sequelize = new Sequelize('calculator', 'admin', 'admin', {
  dialect: 'sqlite',
  storage: dbLocation, 
  dialectOptions: {
    mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE 
  },
});

module.exports = {
    sequelize,DataTypes

}
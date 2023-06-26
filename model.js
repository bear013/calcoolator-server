import { Sequelize } from 'sequelize';
import SQLite from 'sqlite3';

const sequelize = new Sequelize('', '', '', {
  dialect: 'sqlite',
  storage: './db/calculator.db', 
  dialectOptions: {
    mode: SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE 
  },
});


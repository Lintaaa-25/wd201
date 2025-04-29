const Sequelize = require('sequelize');
require('dotenv').config(); // load environment variables from .env file

const config = process.env.DATABASE_URL || require(__dirname + '/../config/config.json')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // you can set this to true if you want to log SQL queries
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Todo = require("./todo")(sequelize, Sequelize);

module.exports = db;

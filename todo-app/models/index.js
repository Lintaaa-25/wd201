const Sequelize = require('sequelize');
require('dotenv').config();  // if you're using .env

// Select the environment (development, test, or production)
const env = process.env.NODE_ENV || 'development';

// Use environment variable DATABASE_URL if available, otherwise use config.json
const config = process.env.DATABASE_URL || require(__dirname + '/../config/config.json')[env];

const sequelize = new Sequelize(config, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Todo = require("./todo")(sequelize, Sequelize);

module.exports = db;

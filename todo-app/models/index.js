const Sequelize = require('sequelize');

// Directly use DATABASE_URL from Render environment variable
const config = process.env.DATABASE_URL || require(__dirname + '/../config/config.json')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // Set to true if you want to see SQL queries in logs
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Todo = require("./todo")(sequelize, Sequelize);

module.exports = db;

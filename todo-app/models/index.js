// models/index.js
const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const env = process.env.NODE_ENV || "development";  // ✅ Define env
const config = require(__dirname + '/../config/config.json')[env];  // ✅ Now this works

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Todo = require("./todo")(sequelize, Sequelize);

module.exports = db;

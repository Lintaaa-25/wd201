// models/index.js
const Sequelize = require("sequelize");

const config = require(__dirname + '/../config/config.json')[env];
const sequelize = new Sequelize(config.database, config.username, config.password, config);


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Todo = require("./todo")(sequelize, Sequelize);

module.exports = db;


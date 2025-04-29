// models/index.js
const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "todos.db",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Todo = require("./todo")(sequelize, Sequelize);

module.exports = db;


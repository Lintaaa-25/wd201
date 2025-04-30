const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: process.env.DATABASE_URL.includes("sslmode=require")
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

const TodoModel = require("./todo");
const Todo = TodoModel(sequelize, Sequelize.DataTypes); // Pass DataTypes here

module.exports = { sequelize, Todo };

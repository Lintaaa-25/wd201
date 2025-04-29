// models/todo.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {}

    static async addTodo({ title, dueDate }) {
      return await this.create({ title, dueDate, completed: false });
    }

    static async getTodos() {
      return await this.findAll({ order: [["id", "ASC"]] });
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    static async remove(id) {
      return await this.destroy({ where: { id } });
    }

    static async overdue() {
      return this.findAll({
        where: {
          dueDate: { [sequelize.Sequelize.Op.lt]: new Date() },
          completed: false,
        },
      });
    }

    static async dueToday() {
      return this.findAll({
        where: {
          dueDate: new Date().toISOString().split("T")[0],
          completed: false,
        },
      });
    }

    static async dueLater() {
      return this.findAll({
        where: {
          dueDate: { [sequelize.Sequelize.Op.gt]: new Date() },
          completed: false,
        },
      });
    }

    static async completedItems() {
      return this.findAll({
        where: { completed: true },
      });
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { notEmpty: true },
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};

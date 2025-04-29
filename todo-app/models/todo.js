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

    // Set completion status
    async setCompletionStatus(status) {
      this.completed = status;
      return await this.save();  // Ensure the status is saved after update
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
      // Handle today’s date in a cleaner way
      const today = new Date().toISOString().split("T")[0];
      return this.findAll({
        where: {
          dueDate: today,
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

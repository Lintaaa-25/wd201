"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list\n");

      console.log("Overdue");
      const overdue = await Todo.overdue();
      overdue.forEach((todo) => console.log(todo.displayableString()));
      console.log("\n");

      console.log("Due Today");
      const today = await Todo.dueToday();
      today.forEach((todo) => console.log(todo.displayableString()));
      console.log("\n");

      console.log("Due Later");
      const later = await Todo.dueLater();
      later.forEach((todo) => console.log(todo.displayableString()));
    }

    static async overdue() {
      const today = new Date().toISOString().slice(0, 10);
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: today },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    static async dueToday() {
      const today = new Date().toISOString().slice(0, 10);
      return await Todo.findAll({
        where: {
          dueDate: today,
        },
        order: [["id", "ASC"]],
      });
    }

    static async dueLater() {
      const today = new Date().toISOString().slice(0, 10);
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: today },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);
      if (todo) {
        todo.completed = true;
        await todo.save();
      }
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      const today = new Date().toISOString().slice(0, 10);
      const datePart = this.dueDate === today ? "" : ` ${this.dueDate}`;
      return `${this.id}. ${checkbox} ${this.title}${datePart}`.trim();
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};

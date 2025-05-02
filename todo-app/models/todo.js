"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
     // Instance method to mark a todo as completed
  markAsCompleted() {
    return this.update({ completed: true });
  }

  // Instance method to mark a todo as incompleted
  markAsIncompleted() {
    return this.update({ completed: false });
  }
    // Adds a new Todo item
    static async addTodo({ title, dueDate }) {
      if (!title || !dueDate) throw new Error("Title and DueDate are required");
      return await Todo.create({ title, dueDate, completed: false });
    }

    // Fetches all Todos: overdue, due today, due later, and completed
    static async getTodos() {
      const today = new Date().toISOString().split("T")[0];

      const overdue = await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: today },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });

      const dueToday = await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: today },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });

      const dueLater = await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: today },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });

      const completedItems = await Todo.findAll({
        where: {
          completed: true,
        },
        order: [["dueDate", "ASC"]],
      });

      return { overdue, dueToday, dueLater, completedItems };
    }

    // Removes a Todo by ID
    static async remove(id) {
      return await Todo.destroy({ where: { id } });
    }

    // Updates a Todo item with the provided fields
   
  // Initialize the Todo model with validations and default values
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to false (incomplete)
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};

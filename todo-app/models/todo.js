"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    
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
    static async updateTodo(id, updatedFields) {
      return await Todo.update(updatedFields, { where: { id } });
    }

    // Updates the completion status of a Todo item
    static async setCompletionStatus(id, completed) {
      if (typeof completed !== 'boolean') {
        throw new Error('Completed status must be a boolean');
      }
      return await Todo.update(
        { completed },
        { where: { id } }
      );
    }
  }

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

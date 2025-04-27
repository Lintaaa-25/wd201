"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTodo({ title, dueDate }) {
      return await Todo.create({ title, dueDate, completed: false });
    }

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

    static async remove(id) {
      return await Todo.destroy({ where: { id } });
    }

    static async updateTodo(id, updatedFields) {
      return await Todo.update(updatedFields, { where: { id } });
    }

    
    static async addTodo({ title, dueDate }) {
      if (!title || !dueDate) throw new Error("Title and DueDate are required");
     return await Todo.create({ title, dueDate, completed: false });
}


    async setCompletionStatus(status) {
      return this.update({ completed: status });
    }
  }

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
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};

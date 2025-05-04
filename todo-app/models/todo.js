const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db");

class Todo extends Model {
  static async getTodos() {
    return await Todo.findAll({ order: [["dueDate", "ASC"]] });
  }

  static async addTodo({ title, dueDate, completed }) {
    return await Todo.create({ title, dueDate, completed });
  }

  static async deleteTodo(id) {
    const todo = await Todo.findByPk(id);
    if (todo) {
      await todo.destroy();
    }
  }

  static async setCompletionStatus(id, completed) {
    const todo = await Todo.findByPk(id);
    if (todo) {
      todo.completed = completed;
      await todo.save();
    }
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

module.exports = Todo;

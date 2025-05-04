const { Model, DataTypes, Op } = require("sequelize");
const sequelize = require("./index");

class Todo extends Model {
  static async addTodo({ title, dueDate }) {
    return await Todo.create({ title, dueDate, completed: false });
  }

  static async getTodos() {
    const todos = await Todo.findAll();
    const today = new Date().toISOString().split("T")[0];
    const overdue = todos.filter(t => t.dueDate < today && !t.completed);
    const dueToday = todos.filter(t => t.dueDate === today && !t.completed);
    const dueLater = todos.filter(t => t.dueDate > today && !t.completed);
    const completedItems = todos.filter(t => t.completed);
    return { overdue, dueToday, dueLater, completedItems };
  }

  async markAsCompleted() {
    return await this.update({ completed: true });
  }

  async markAsIncompleted() {
    return await this.update({ completed: false });
  }

  static async remove(id) {
    return await Todo.destroy({ where: { id } });
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

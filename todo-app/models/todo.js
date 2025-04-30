const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Todo = sequelize.define("Todo", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Title must not be empty" },
      },
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Due date is required" },
        isDate: { msg: "Must be a valid date" },
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  // Method to update completion status
  Todo.prototype.setCompletionStatus = async function (status) {
    this.completed = status;
    await this.save();
  };

  // Group todos into four categories
  Todo.groupTodos = async function () {
    const todos = await Todo.findAll({ order: [["dueDate", "ASC"]] });
    const today = new Date().toISOString().split("T")[0];

    return {
      overdue: todos.filter((todo) => !todo.completed && todo.dueDate < today),
      dueToday: todos.filter((todo) => !todo.completed && todo.dueDate === today),
      dueLater: todos.filter((todo) => !todo.completed && todo.dueDate > today),
      completedItems: todos.filter((todo) => todo.completed),
    };
  };

  return Todo;
};

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Todo = sequelize.define("Todo", {
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN,
  });

  Todo.prototype.setCompletionStatus = async function (status) {
    this.completed = status;
    await this.save();
  };

  Todo.groupTodos = async function () {
    const todos = await Todo.findAll();
    const today = new Date().toISOString().split("T")[0];
    const groups = { overdue: [], dueToday: [], dueLater: [], completed: [] };

    todos.forEach((todo) => {
      if (todo.completed) return groups.completed.push(todo);
      if (todo.dueDate < today) groups.overdue.push(todo);
      else if (todo.dueDate === today) groups.dueToday.push(todo);
      else groups.dueLater.push(todo);
    });

    return groups;
  };

  return Todo;
};

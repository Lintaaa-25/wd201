// Assuming Sequelize ORM
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class Todo extends Model {}

Todo.init({
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
}, {
  sequelize,
  modelName: 'Todo',
});

// Fetch all todos
Todo.getTodos = async function () {
  return await Todo.findAll();
};

// Create a new Todo
Todo.createTodo = async function (data) {
  return await Todo.create(data);
};

// Remove a Todo by ID
Todo.remove = async function (id) {
  return await Todo.destroy({ where: { id } });
};

module.exports = { Todo };

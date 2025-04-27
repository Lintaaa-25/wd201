const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
});

// Define Todo model
const Todo = sequelize.define('Todo', {
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
});

// Static method: Add a new Todo
Todo.addTask = async function (params) {
  return await this.create(params);
};

// Static method: Show all Todos
Todo.showList = async function () {
  return await this.findAll();
};

// Static method: Remove a Todo by id
Todo.remove = async function (id) {
  return await this.destroy({
    where: {
      id,
    },
  });
};

module.exports = { Todo, sequelize };
